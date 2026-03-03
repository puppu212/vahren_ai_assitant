# Varentuga Scripting Reference (ヴァーレントゥーガ スクリプト リファレンス)

Technical documentation for the game system "Vahren Tuuga".

---

## 1. Scenario Creation (シナリオ作成)

### 1.1 Overview

Scenarios are created within their own folders inside the `vahren` directory.

### 1.2 Folder Structure

- `image/`: Images (png, bmp)
- `bgm/`: Music (mid, mp3, etc.)
- `sound/`: Sound effects (wav)
- `map/`: Battle maps (.map created by MapMaker)
- `stage/`: Map chip data
- `script/`: Scenario data files (.dat)
- `a_default/`: Default system data

### 1.3 Development Tools

- **Vahren.exe**: The game host.
- **MapMaker.exe**: Creates battle maps.
- **ImageView.exe**: Manages images and icons.

---

## 2. Scripting Language Specifications (スクリプト言語の仕様)

### 2.1 Basic Rules

- **Encodings**: Plain text (Shift-JIS/UTF-8 compatible). Use `debug_paper.txt` with `encode` to encrypt.
- **Comments**:
  - `//`: Single line comment.
  - `/* ... */`: Block comment.
- **Case Sensitivity**: Identifiers (structure names, tags) are case-sensitive.
- **Delimiters**: Comma-separated or space-separated for most lists. Semicolons are used for long text blocks in `detail` or `event` structures.

### 2.2 Operators

Used in conditional expressions (`if` statements):

- `+`, `-`, `*`, `/`, `%` (Percentage calculation)
- `==`, `!=`, `<=`, `>=`, `<`, `>`
- `&&` (And), `||` (Or)
- `&VarName&`: Variable interpolation inside strings.
- `@VarName`: String variable indicator.

---

## 3. Data Structures (データ構造)

Data is defined in blocks: `StructType StructID { key = value }`.

### 3.1 scenario

Defines the overall scenario settings.

| Property        | Description                              |
| :-------------- | :--------------------------------------- |
| `name`          | Scenario name.                           |
| `help`          | Brief description.                       |
| `text`          | Detailed description.                    |
| `image`         | Thumbnail image.                         |
| `world`         | Main world event loop (runs every turn). |
| `fight`         | Battle transition event.                 |
| `politics`      | Internal politics menu event.            |
| `camp`          | Camp menu event (for talent play).       |
| `spot_capacity` | Max units per territory.                 |
| `member`        | Max members per unit.                    |

### 3.2 power

Defines a faction (force).

| Property | Description                           |
| :------- | :------------------------------------ |
| `name`   | Faction name.                         |
| `master` | The master unit ID.                   |
| `member` | List of starting spots (territories). |
| `staff`  | Classes/Races the faction can lead.   |
| `merce`  | Standard recruitable units.           |
| `head`   | Capital spot ID.                      |
| `flag`   | Flag image ID in `flag` folder.       |

### 3.3 spot

Defines a territory/territory node.

| Property   | Description                              |
| :--------- | :--------------------------------------- |
| `name`     | Territory name.                          |
| `map`      | Battle map file ID.                      |
| `member`   | Starting units in this spot.             |
| `merce`    | Recruitable units specific to this spot. |
| `gain`     | Economic value.                          |
| `castle`   | Castle health/defense value.             |
| `capacity` | Max units stay (Max 24).                 |
| `x, y`     | Coordinates on the world map.            |

### 3.4 unit / class

Defines an individual unit or a job class. Properties are largely shared.

| Property             | Description                                  |
| :------------------- | :------------------------------------------- |
| `name`               | Display name.                                |
| `face`               | ID of face image in `face` folder.           |
| `image`              | ID of map sprite in `image` folder.          |
| `picture`            | ID of standing portrait in `picture` folder. |
| `price`              | Recruitment cost.                            |
| `cost`               | Upkeep cost per turn.                        |
| `hp` / `mp`          | Base hit points and magic points.            |
| `attack` / `defense` | Physical stats.                              |
| `magic` / `magdef`   | Magical stats.                               |
| `speed` / `dext`     | Agility and dexterity.                       |
| `move`               | Movement speed.                              |
| `hprec` / `mprec`    | HP and MP recovery per turn in battle.       |
| `skillset`           | List of skillsets associated with the unit.  |
| `skill`              | Specific skills the unit possesses.          |
| `merce`              | Units this leader can recruit.               |
| `level`              | Initial level.                               |
| `exp`                | Base experience value given when defeated.   |
| `gender`             | `male`, `female`, or `none`.                 |
| `align`              | Compatibility alignment (0-100).             |

### 3.5 race

Defines species data (Human, Elf, etc.).

| Property    | Description                             |
| :---------- | :-------------------------------------- |
| `name`      | Race name.                              |
| `move_type` | Movement type ID (e.g., `foot`, `fly`). |
| `consti`    | Resistance/Weakness attributes.         |

---

## 4. Skill System (スキル)

Skills define the actions units can take in battle.

### 4.1 skillset

A container for multiple skills.

### 4.2 attribute (attr)

Defines elemental or physical categories (e.g., `fire`, `slash`).

### 4.3 skill

Defines an individual action.

| Type      | Description                     |
| :-------- | :------------------------------ |
| `missile` | Projectile/Magic attacks.       |
| `sword`   | Melee attacks.                  |
| `heal`    | Recovery skills.                |
| `summon`  | Calling other units.            |
| `charge`  | Buffs or physical dash attacks. |

**Common Properties:**

- `name`: Display name.
- `help`: Description text.
- `attr`: Attribute type.
- `pow`: Power/Damage.
- `range`: Attack range.
- `speed`: Missile/Animation speed.
- `ct`: Cast time/Cooldown.

## 5. Game Configuration (context)

The `context` structure defines global game settings, difficulty modes, and UI properties.

| Category       | Typical Keys                        | Description                                                     |
| :------------- | :---------------------------------- | :-------------------------------------------------------------- |
| **Difficulty** | `mode_easy`, `mode_hard`            | Defines available difficulty modifiers (e.g., `blind`, `dead`). |
| **Limits**     | `max_unit`, `btl_unitmax`           | Global unit caps.                                               |
| **Growth**     | `gain_per`, `win_gain`              | Economic and experience growth coefficients.                    |
| **Range**      | `employ_range`, `support_range`     | Distance limits for recruitment and reinforcement.              |
| **UI/Visual**  | `title_name`, `wnd_alpha`, `font16` | Game title, window transparency, and fonts.                     |
| **Battle**     | `btl_limit`, `btl_msgtime`          | Battle time limit and message display duration.                 |

---

## 6. Map and Environment (field, object, movetype)

### 6.1 field (Map Chips)

Defines properties of the ground tiles.

- `attr`: Ground type (grass, sea, mountain).
- `type`: `coll` (impassable), `wall` (blocking missiles).
- `alt`: Altitude for 3D-like perspective.

### 6.2 object (Structures)

Defines buildings, walls, and obstacles placed on the map.

- `type`: `coll`, `wall`, `gate`, `break` (destructible).
- `land_base`: If `on`, ignores floor height.
- `image2`: Appearance after being destroyed.

### 6.3 movetype

Defines how different units move across `field` attributes.

- `consti`: `grass*10`, `sea*0`, etc. (Multipliers for movement speed on specific terrain).

### 6.4 dungeon

Defines dungeon crawler mode settings.

- `max`: Total floors.
- `monster`: Randomly encountered units.
- `item`: Treasure chest contents.

## 7. Event Script Functions (イベント関数リファレンス)

Functions are categorized by their primary usage.

### 7.1 Variables (変数)

- **Numerical Variables**: Global/Persistent. Used as `VarName`.
- **String Variables**: Temporary. Prefix with `@` (e.g., `@MyVar`). Stores IDs of `power`, `unit`, etc.

### 7.2 Numerical Calculations

| Function        | Description         |
| :-------------- | :------------------ |
| `set(var, val)` | Set `var` to `val`. |
| `add(var, val)` | `var += val`.       |
| `sub(var, val)` | `var -= val`.       |
| `mul(var, val)` | `var *= val`.       |
| `div(var, val)` | `var /= val`.       |
| `mod(var, val)` | `var %= val`.       |

### 7.3 String Control (文字変数)

| Function         | Description                               |
| :--------------- | :---------------------------------------- |
| `setv(@var, id)` | Set `@var` to ID.                         |
| `addv(@var, id)` | Append ID to list in `@var`.              |
| `subv(@var, id)` | Remove ID from `@var`.                    |
| `clear(@var)`    | Clear all strings in `@var`.              |
| `shuffle(@var)`  | Randomize the order of strings in `@var`. |

### 7.4 Information Retrieval (代入関数)

Retrieves game state into variables.

- `pushRank(unit, var)`: Get rank (Master=4, Elite=1, etc.).
- `pushLevel(unit, var)`: Get current level.
- `storePlayerUnit(@var)`: Store player unit ID into `@var`.
- `storeAllPower(@var)`: Store all surviving faction IDs into `@var`.
- `storeNextSpot(spot, @var)`: Store adjacent territories into `@var`.

### 7.5 Scenario & World Commands

| Function                  | Description                                       |
| :------------------------ | :------------------------------------------------ |
| `addUnit(unit, spot)`     | Add or move unit to spot.                         |
| `addPower(power)`         | Spawn a new faction.                              |
| `addSpot(spot, power)`    | Give spot to power.                               |
| `setLeague(p1, p2, turn)` | Form alliance for `turn` turns (-1 for infinite). |
| `msg(text)`               | Display message in bottom window.                 |
| `talk(unit, text)`        | Display unit dialogue.                            |
| `fadeout()` / `fadein()`  | Screen transitions.                               |

### 7.6 Battle Commands

Functions used within battle events or `battle { ... }` blocks.
| Function | Description |
| :--- | :--- |
| `battle { ... }` | Defines battle logic block. |
| `addTroop(unit, x, y, dir, army)`| Spawn unit onto battle map. |
| `moveTroop(unit, x, y, dir)`| Order unit to move. |
| `win()` | End the battle immediately. |
| `routine(event)` | Call sub-event logic in battle. |

---

## 8. Conditional Logic (条件判定)

Used in `if (condition) { ... }` blocks.

| Function           | Logic                                      |
| :----------------- | :----------------------------------------- |
| `yet(event_id)`    | True if event has NOT occurred.            |
| `isPlayer(id)`     | True if faction/unit is player-controlled. |
| `isAlive(id)`      | True if faction/unit is still in game.     |
| `countSpot(power)` | Returns number of territories owned.       |
| `inBattle(id)`     | True if unit/power is in current battle.   |
| `rand()`           | Returns 0-99.                              |

---

## 9. Troubleshooting and Debugging

- **Debug Mode**: Place `debug_paper.txt` in game directory.
- **encode**: Encrypt script files.
- **musicoff**: Fast startup without BGM.
- **V Key**: Reload specified structures during play.

## 10. Game Mechanics & Calculations (ゲームメカニクス)

### 10.1 Damage Calculation (ダメージ計算式)

- **Physical Damage**: `(Attack * Power / 100) - (Defense / 2)`
- **Magical Damage**: `(Magic * Power / 100) - (MagDef / 2)`
- **Attribute Modification**: Damage is multiplied by the target's resistance coefficient for the specific attribute.
- **Random Variance**: Default is 80% to 120% of calculated damage (adjustable in `context`).

### 10.2 Buffs and Status Effects

| Effect        | Description                                                   |
| :------------ | :------------------------------------------------------------ |
| **Poison**    | Deals 10% max HP damage at intervals.                         |
| **Illusion**  | Base miss rate: 66%.                                          |
| **Paralysis** | Disables movement and actions.                                |
| **Confusion** | Causes units to wander or attack allies. Base miss rate: 50%. |

### 10.3 Movement Types

Speed is modified based on the `movetype` coefficients for each `field` attribute.

- **Foot**: Standard land movement.
- **Fly**: Ignores most terrain penalties.
- **Sea**: High speed in water, penalty on land.

---
