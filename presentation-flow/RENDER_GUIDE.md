# Render deployment and live operation

## Deploy as a separate Render service

1. Put the contents of this `presentation-flow` folder in its own GitHub repository, or keep it in the existing repository and use `presentation-flow` as Render's Root Directory.
2. In Render, choose **New > Blueprint** and connect the repository. Render reads `render.yaml` automatically.
3. When prompted, set the secret environment variable `ADMIN_PASSWORD` to a strong password.
4. Deploy and wait for the build and health status to complete.

If creating a Web Service manually, use:

- Runtime: Node
- Root Directory: `presentation-flow` (only when this folder remains inside a larger repository)
- Build Command: `npm run build`
- Start Command: `npm start`
- Environment variable: `ADMIN_PASSWORD=<your-secret-password>`

## One URL

Distribute only `https://YOUR-SERVICE.onrender.com/`.

- Participants open or scan this URL and see the polling screen.
- The facilitator selects the discreet **Presenter access** link at the bottom, then signs in.
- In Presenter View, select **Present full screen**. A presentation window opens at the same URL and is automatically recognized as the projector window.

## Before the event

1. Open the application URL, select **Presenter access**, and sign in.
2. Add questions in their presentation order.
3. Select **Present full screen**, move that window to the projector, and enter browser full-screen mode.
4. Keep Presenter View on the facilitator's laptop.
5. Start at **Welcome**, then use **Next presentation step** throughout the session.

## Flow per question

`Question reveal -> response collection -> response lock -> results reveal -> discussion`

After discussion, **Next** advances to the following question. After the final discussion, it advances to the session summary.

## Render updates

Push changes to the connected GitHub branch. With Auto-Deploy enabled, Render rebuilds automatically. Otherwise use **Manual Deploy > Deploy latest commit** in the Render dashboard.

The service stores session state in a local JSON backup. Render's filesystem is ephemeral, so state can be lost on a restart or redeploy. Do not deploy during a live session. For durable sessions, move state to an external database in a later iteration.
