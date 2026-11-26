import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { localDatabasePath } from "../auth/config.ts";
import { createTurn } from "../../game/combat/turn.ts";
import type { Participant } from "../../game/combat/turn.ts";

export function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function schemaVersion(db: DatabaseSync): number {
  return Number(db.prepare("PRAGMA user_version").get()?.user_version);
}

function initialize(db: DatabaseSync) {
  if (schemaVersion(db) === 2) return;
  transaction(db, () => {
    const version = schemaVersion(db);
    if (version === 2) return;
    if (version !== 0 && version !== 1) throw new Error("Version de base locale non prise en charge.");
    if (version === 0) {
    db.exec(`
      CREATE TABLE app_accounts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE CHECK(email = lower(email)),
        username TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('player','gm','admin')),
        created_at INTEGER NOT NULL
      ) STRICT;
      CREATE TABLE local_auth_sessions (
        token_hash TEXT PRIMARY KEY,
        account_id TEXT NOT NULL REFERENCES app_accounts(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      ) STRICT;
      CREATE INDEX local_auth_sessions_account_idx ON local_auth_sessions(account_id);
      CREATE TABLE local_combat_scenarios (
        id TEXT PRIMARY KEY,
        state TEXT NOT NULL CHECK(json_valid(state)),
        updated_at INTEGER NOT NULL
      ) STRICT;
    `);
    const seed = [
      ["joueur1@example.test","joueur_01","player"],
      ["joueur2@example.test","joueur_02","player"],
      ["joueur3@example.test","joueur_03","player"],
      ["mj@example.test","maitre_du_jeu","gm"],
      ["admin@example.test","administrateur","admin"],
    ];
    const ids = new Map<string,string>();
    const insert = db.prepare("INSERT INTO app_accounts(id,email,username,role,created_at) VALUES(?,?,?,?,?)");
    for (const [email, username, role] of seed) {
      const id = randomUUID();
      ids.set(email, id);
      insert.run(id, email, username, role, Date.now());
    }
    const participants: Participant[] = [
      {id:"lysa",accountId:ids.get(seed[0][0])!,shipId:"raviolo",name:"Lysa Arven",station:"Capitaine"},
      {id:"nael",accountId:ids.get(seed[1][0])!,shipId:"raviolo",name:"Nael Coris",station:"Pilote"},
      {id:"k17-captain",accountId:ids.get(seed[2][0])!,shipId:"k17",name:"Poste A",station:"Commandement"},
    ];
    db.prepare("INSERT INTO local_combat_scenarios(id,state,updated_at) VALUES(?,?,?)")
      .run("starlight", JSON.stringify(createTurn(participants)), Date.now());
    }
    db.exec("CREATE TABLE IF NOT EXISTS local_combat_experience (id TEXT PRIMARY KEY REFERENCES local_combat_scenarios(id) ON DELETE CASCADE, experience TEXT NOT NULL CHECK(json_valid(experience))) STRICT; PRAGMA user_version = 2;");
  });
}

export function withLocalDb<T>(work: (db: DatabaseSync) => T): T {
  const path = localDatabasePath();
  mkdirSync(dirname(path), {recursive:true});
  const db = new DatabaseSync(path);
  try {
    db.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
    initialize(db);
    return work(db);
  } finally {
    db.close();
  }
}
