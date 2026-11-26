import App from "@/legacy/App";
import {currentAccount} from "@/server/auth/session";
import {hasStaffPermission} from "@/features/administration/permissions";
import {notFound} from "next/navigation";
export const dynamic="force-dynamic";
export default async function LegacyPage({params}:{params:Promise<{legacy?:string[]}>}){
  const {legacy}=await params;
  const account=await currentAccount();
  const canOpenAdministration=hasStaffPermission(account?.role,"administration:access");
  const canPreviewAdminMap=hasStaffPermission(account?.role,"map:preview");
  if(legacy?.[0]==="admin"&&!canPreviewAdminMap)notFound();
  return <div id="root"><App canOpenAdministration={canOpenAdministration} canPreviewAdminMap={canPreviewAdminMap}/></div>;
}
