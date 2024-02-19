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
    pub is_moving: bool,
}

impl Player {
    pub fn change_direction(&mut self, direction: Direction) {
        self.direction = direction;
    }

    pub fn change_is_moving(&mut self, is_moving: bool) {
        self.is_moving = is_moving;
    }
}
