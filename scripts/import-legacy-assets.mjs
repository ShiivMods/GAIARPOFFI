import {readFile,mkdir,copyFile,rm,mkdtemp} from "node:fs/promises";
import {join,dirname} from "node:path";
import {tmpdir} from "node:os";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const root=process.cwd();
const manifest=JSON.parse(await readFile(join(root,"migration","manifest.json"),"utf8"));
const gitHash=bytes=>createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
async function matches(file,entry){try{return gitHash(await readFile(file))===entry.sha;}catch{return false;}}
async function missingEntries(){const bad=[];for(const entry of manifest.assets)if(!await matches(join(root,entry.path),entry))bad.push(entry);return bad;}
const bad=await missingEntries();
if(process.argv.includes("--check")){
  if(bad.length){console.error("Assets absents ou différents :\n"+bad.map(x=>x.path).join("\n"));process.exitCode=1;}
  else console.log(manifest.assets.length+" illustrations historiques vérifiées.");
}else if(!bad.length){console.log("Toutes les illustrations historiques sont déjà présentes.");}
else{
  const temp=await mkdtemp(join(tmpdir(),"gaia-legacy-"));
  try{
    const checkout=join(temp,"source");
    execFileSync("git",["init",checkout],{stdio:"inherit"});
    execFileSync("git",["-C",checkout,"fetch","--depth=1","https://github.com/"+manifest.repository+".git",manifest.commit],{stdio:"inherit"});
    execFileSync("git",["-C",checkout,"checkout","--detach","FETCH_HEAD"],{stdio:"inherit"});
    const actual=execFileSync("git",["-C",checkout,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
    if(actual!==manifest.commit)throw new Error("Commit historique incorrect");
    for(const entry of bad){
      const from=join(checkout,entry.path),to=join(root,entry.path);
      if(!await matches(from,entry))throw new Error("Empreinte incorrecte : "+entry.path);
      await mkdir(dirname(to),{recursive:true});
      await copyFile(from,to);
    }
    console.log(manifest.assets.length+" illustrations historiques vérifiées.");
  }finally{await rm(temp,{recursive:true,force:true,maxRetries:3});}
}
