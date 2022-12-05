import { Bandeirante } from '@bandeirantes/events';

export class Player extends Bandeirante {
  isMoving: boolean;

  constructor(data: Bandeirante) {
    super();
    this.color = data.color;
    this.conqueredPercentage = data.conqueredPercentage
    this.direction = data.direction
    this.name = data.name
    this.isMoving = false
    this.id = data.id
    this.position = data.position
  }
}
