import { ErdViz } from "./index";
import { TableNameLibralian } from "./TableNameLibralian";

// FIXME: sweaty check
export function estimateIsForeign(field: ErdViz.Field): boolean {
  if (field.getName().indexOf("id") === -1) {
    return false;
  }
  const estimatedTableName = field.getName().split("_id")[0];
  const libralian = TableNameLibralian.getInstance();
  return libralian.isInclude(estimatedTableName);
}
