import { Cardinality } from "../Cardinality";
import { ErdViz } from "../erdviz";
import { SyntaxEntity } from "./SyntaxEntity";

export class RelationshipSyntaxEntity implements SyntaxEntity {
  private cardinality?: Cardinality;
  private fromField?: ErdViz.Field;
  private identifying: boolean;
  private label: string;
  private toField?: ErdViz.Field;

  public setCardinality(
    this: RelationshipSyntaxEntity,
    cardinality: Cardinality
  ) {
    this.cardinality = cardinality;
  }

  public setFromField(this: RelationshipSyntaxEntity, fromField: ErdViz.Field) {
    this.fromField = fromField;
  }

  public setIdentifying(this: RelationshipSyntaxEntity, identifying: boolean) {
    this.identifying = identifying;
  }

  public setToField(this: RelationshipSyntaxEntity, toField: ErdViz.Field) {
    this.toField = toField;
  }

  public toDot(): string {
    if (!this.toField || !this.fromField) {
      throw Error("To Field or toFrom or both is not declared.");
    }
    const label = this.label ? `\nlable=<<FONT>${this.label}</FONT>>` : "";
    const style = this.identifying ? "solid" : "dotted";
    let cardStr = "";
    switch (this.cardinality) {
      /*
      case Cardinality.OneToOne:
        cardStr = `[arrowhead=noneotee,headlabel=<<FONT>1</FONT>>,${label}style=${style},arrowtail=noneotee,taillabel=<<FONT>1</FONT>>]`;
        break;*/
      case Cardinality.OneToMany:
        cardStr = `[arrowhead=noneotee,headlabel=<<FONT>1</FONT>>,${label}style=${style},arrowtail=ocrow,taillabel=<<FONT>0..N</FONT>>]`;
        break;
      /*
      case Cardinality.ManyToMany:
        cardStr = `[arrowhead=ocrow,headlabel=<<FONT>0..N</FONT>>,${label}style=${style},arrowtail=ocrow,taillabel=<<FONT>1..1</FONT>>]`;
        break;*/
    }
    return `\n${this.toField.getTable().name} -- ${
      this.fromField.getTable().name
    } ${cardStr} ;`;
  }
}
