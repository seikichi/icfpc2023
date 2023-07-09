use log::debug;

use crate::*;

pub fn prune_attendees(attendees: &[Attendee], room: &Room, threshold: f32) -> Vec<Attendee> {
    let mut pruned = vec![];
    for attendee in attendees {
        let importance = attendee_importance(attendee, room);
        debug!("attendance_importance = {}", importance);
        if importance >= threshold {
            pruned.push(attendee.clone());
        }
    }
    pruned
}

pub fn attendee_importance(attendee: &Attendee, room: &Room) -> f32 {
    let distance_to_stage =
        geo::distance_to_rectangle(room.stage_pos, room.stage_size, attendee.pos);
    let max_abs_taste = attendee
        .tastes
        .iter()
        .map(|t| t.abs())
        .max_by(|a, b| a.total_cmp(b))
        .unwrap_or(0.0);
    1_000_000.0 * max_abs_taste / (distance_to_stage * distance_to_stage)
}
