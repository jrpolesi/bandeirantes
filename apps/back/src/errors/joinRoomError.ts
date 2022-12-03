import type { Socket } from "socket.io"
import { emitEvent } from "@bandeirantes/events"

type ErrorStatus =  "roomId" | "password" | "playerLimit" | "gameId"

export function joinRoomError(error: ErrorStatus, socket: Socket){
  let message: string

  if (error === "roomId") message = "Invalid room id"

  if (error === "gameId") message = "Invalid game id"
  
  if (error === "password") message = "Invalid password"
  
  if (error = "playerLimit") message = "Room already reach the maximum players"

  if(!message) message = "Unknown error"

  return emitEvent("join_room_response", socket, {
    message,
    succeeded: false
  })
}