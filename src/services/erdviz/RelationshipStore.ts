export enum DBRelation {
  OneToMany
}

interface RelationShip {
  dbRelation: DBRelation;
  from: string;
  to: string;
}

export class RelationshipStore {
  private relationships: RelationShip[] = [];
  private static relationshipStore = new RelationshipStore();
  private constructor() {}
  public pushRelationship(
    this: RelationshipStore,
    relation: RelationShip
  ): void {
    this.relationships.push(relation);
  }
  public getRelationship(this: RelationshipStore): RelationShip[] {
    return this.relationships;
  }
  public static getInstance(): RelationshipStore {
    return RelationshipStore.relationshipStore;
  }
}
