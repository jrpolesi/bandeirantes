pub enum Direction {
    north,
    south,
    east,
    west,
}

pub struct Player {
    pub name: String,
    pub socket_id: String,
    pub color_hex_code: String,
    pub direction: Direction,
}
