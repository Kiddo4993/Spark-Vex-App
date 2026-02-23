# Spark VEX — User Guide & Rules Book

Welcome to Spark VEX! This platform is a powerful, Bayesian-driven scouting and alliance selection tool designed to help your team dominate competitions.

## 1. Getting Started
- **One Account Per Team**: The platform is organized by teams. Only **one email account** can be registered per VEX Team Number (e.g., `1421A`). 
- **The Dashboard**: Once logged in, you will see your dashboard. By default, your rating is 100 with an uncertainty of 50.

## 2. Importing Data
Data is what powers the Bayesian model. You can import matches and skills data in two ways:
- **RobotEvents API**: Head to the Import page, enter a RobotEvents API key, and search for the event you want to import. The app will fetch all matches automatically.
- **XLS File Upload**: Download the official `.xls` match or skills file from RobotEvents or Tournament Manager and drop it into the Import section. The engine will intelligently map the columns.

*What happens during import?*
Our engine will replay every single imported match chronologically. It uses a Bayesian rating system to analyze the outcome of the match, compare it to expectations, and distribute rating rewards/penalties to each of the 4 teams involved based on their individual strength and uncertainty.

## 3. The Alliance Selection Engine
The Alliance Selection dashboard is your command center during the final hours of a competition. It analyzes your team against every other team in the database to calculate:
- **Combined Synergy Win Probability**: If you pick Team X, what is your mathematical chance of winning against an average alliance?
- **Auto Conflicts**: The system warns you (⚔️) if a potential pick runs their autonomous routine on the exact same side of the field as you, preventing collisions.
- **Scout Needed**: The system flags teams (⚠️) whose ratings have high uncertainty, meaning they might be hidden gems or false positives, encouraging you to scout them manually.

## 4. Team Profiles & Collaboration
- **Editable Profiles**: Click on your Team Profile to add Private Notes, specify your Drivetrain type, and list Strategy Tags (e.g., `defensive`, `fast auton`).
- **Awards Tracking**: Press the "Sync Awards" button on your profile to securely fetch and freeze your team's historical RobotEvents awards.
- **Connections & Tasks**: You can send connection requests to allied teams and assign tasks to your members using the Kanban-style Task Board.

## Troubleshooting FAQ
**I imported matches for my team, but I can't create an account!**
When you import an XLS file, the database creates a mathematical profile for every single team in that document. If your team is in there, the system already knows about you! You can still sign up normally—just enter your team number and email, and the system will link your new login directly to that existing mathematical profile. *Make sure you type your team number exactly as it appeared in the tournament.*
