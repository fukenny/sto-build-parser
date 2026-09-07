# Measurement contract · parser schema 2

## Timing and scope

Encounters split when consecutive valid records are more than 60 seconds apart. All valid records affect detected duration, including healing. Duration is last minus first timestamp, minimum one second. Full-log analysis removes the gap split, so DPS includes idle gaps. No stitching across files or mission/difficulty recognition occurs.

## Damage

Outgoing totals combine hull and shield damage. Source ownership groups pets, summons, and other owned entities under their logged owner. Self-targeted damage and `*` feedback abilities are excluded from offense. Incoming damage is counted only when the target is the selected player's identifier and includes self-damage. No incoming NPC/pet damage is guessed into the player's totals.

Hull healing: negative HitPoints magnitude. Shield healing: negative Shield magnitude with nonnegative secondary magnitude. Other records are treated as damage using the absolute primary magnitude. Paired hull/shield records remain separate events. Event counts are not activation counts.

## Survivability

Incoming hull and shield sums are separated. Largest damage record is the maximum primary magnitude among incoming damage records. Pressure buckets accumulate hull plus shield damage per second relative to encounter start. The chart can combine several buckets for display, but the reported peak uses one-second buckets. This is an aligned bucket, not a sliding window.

Received healing sums healing records targeting the player. Self healing includes sources owned by that player; external healing uses a different owner identifier. Healing to a player's pets is not healing received by the player. These are logged values; overhealing and effective restored health cannot be determined here.

Some heals have an empty target and `*` target ID (observed in Energy Refrequencer records). They are excluded from received healing because the recipient is not explicit. The UI discloses the selected player's outgoing healing with unspecified targets separately. Consequently, explicitly received healing can substantially undercount actual healing; zero means no explicitly targeted records, not that no healing occurred.

No death estimate is shown. No survivability rating or causal explanation is generated. Logs may omit events outside the recorder's visibility. The same encounter can differ between recorders.

## Comparisons and older data

Each saved run has equal weight. DPS means, sample standard deviation, and ranges describe observed variation. Incoming damage and healing rates divide each run by its detected duration, then average those rates. No significance test or confidence score is claimed.

Missing schema-2 survival fields return null (displayed as “Not recorded”) when any run in that group lacks them; zero is reserved for measured zero. Old total incoming damage remains usable. Entire-log and individual encounter evidence cannot be mixed under one comparison label. Overlapping encounter IDs cannot be saved twice for the same player.

Known limitation: extended/modified combat changes its content hash. Save completed encounters and avoid treating an updated copy of the same fight as an independent trial.
