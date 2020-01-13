import { Cardinality } from "./Cardinality";

export interface Relationship {
  dbRelation: Cardinality;
  fromTable: string;
  toTable: string;
}
