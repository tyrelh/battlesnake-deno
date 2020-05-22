export interface Game {
    id: string,
    timeout: number
}

export interface Cell {
    x: number,
    y: number
}

export interface Snake {
    id: string,
    name: string,
    health: number,
    body: Cell[],
    head: Cell,
    length: number,
    shout: string
}

export interface Board {
    height: number,
    width: number,
    food: Cell[],
    snakes: Snake[]
}

export interface GameState {
    game: Game,
    turn: number,
    board: Board,
    you: Snake
}

// Battlesnake API v1 Responses

export interface RootResponse {
    color: string,
    head: string,
    tail: string,
    apiversion: string,
    author: string
}

export interface MoveResponse {
    move: string
}