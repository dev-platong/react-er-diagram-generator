import { Relationship } from "./Relationship";

export class RelationshipStore {
  private relationships: Relationship[] = [];
  private static relationshipStore = new RelationshipStore();
  private constructor() {}
  public pushRelationship(
    this: RelationshipStore,
    relation: Relationship
  ): void {
    this.relationships.push(relation);
  }
  public getRelationship(this: RelationshipStore): Relationship[] {
    return this.relationships;
  }
  public setRelationship(
    this: RelationshipStore,
    relationships: Relationship[]
  ): void {
    this.relationships = relationships;
  }
  public static getInstance(): RelationshipStore {
    return RelationshipStore.relationshipStore;
  }
}
