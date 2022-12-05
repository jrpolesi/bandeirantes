import { Land } from "@bandeirantes/events"

export class GameLand extends Land {
  previousOwnerId: string | null

  constructor(id: string){
    super()

    this.id = id
    this.owner = null
    this.previousOwnerId = null
    this.status = null
  }
}