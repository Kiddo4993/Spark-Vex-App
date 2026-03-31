# SparkVEX: User Guide & Rules Book

Welcome to SparkVEX! We built this platform as a ridiculously powerful, math-driven scouting and alliance selection tool to help your team absolutely dominate your next competition.

## 1. Getting Started
- **One Account Per Team**: We keep things organized by team number. That means only **one email account** can be registered per official VEX Team Number (like `1421A`). Work with your teammates to decide who holds the keys!
- **Your Dashboard**: As soon as you log in, you'll hit your dashboard. If you're completely brand new to the system, our Bayesian model drops you in with a baseline rating of 100 and an uncertainty margin of 50.

## 2. Pumping in the Data
The math engine needs match data to actually work. Fortunately, getting it in is super easy. You have two options:
- **RobotEvents API**: Jump over to the Import page, paste in a RobotEvents API key, and just search for your event. The app will scrape all the matches automatically.
- **XLS File Upload**: Not into APIs? Just download the official `.xls` match or skills file straight from Tournament Manager and drop it right into the Import section. Our engine will map out all the columns for you.

*What actually happens when you hit import?*
Our engine basically "watches" every single match you imported in chronological order. It uses a custom Bayesian rating system to look at who won, compare it to who *should* have won, and then hands out rating bumps or penalties to all four teams on the field based on how hard the match was.

## 3. The Alliance Selection Engine
The Alliance Selection dashboard is your command center for when eliminations roll around. It compares your team against every other team on the board to figure out:
- **Combined Synergy Win Probability**: If you actually picked Team X, what is your genuine mathematical chance of winning a match?
- **Auto Conflicts**: The system will literally throw up a warning sign (⚔️) if a potential pick runs their autonomous routine on the exact same side of the field as you. Nobody likes a traffic jam!
- **Scout Needed**: The system flags teams (⚠️) if their ratings have a super high uncertainty. That usually means they are either hidden gems or completely unpredictable, so we highly recommend you send a scouter to watch them manually.

## 4. Team Profiles & Collaboration
- **Editable Profiles**: Click on your Team Profile to jot down Private Notes, lock in your Drivetrain type, and drop in Strategy Tags (like `defensive` or `fast auton`) so everyone knows what you're capable of.
- **Awards Tracking**: Smash the "Sync Awards" button on your profile to securely pull down your team's historical RobotEvents awards to show off your hardware.
- **Connections & Tasks**: You can shoot connection requests over to allied teams, or manage your own team's messy to-do list using our built-in Kanban Task Board.

## Troubleshooting FAQ
**I imported matches for my team, but it won't let me create an account!**
Here is the deal: when you import an XLS file, the database creates a mathematical profile for every single team listed in that document. If your team played at that tournament, the system already knows who you are! You can still sign up normally: just punch in your team number and email, and the system will link your brand new login directly to the mathematical profile we already built for you. *Just make absolutely sure you type your team number exactly as it appeared on the tournament schedule.*
