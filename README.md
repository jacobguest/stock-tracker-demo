# Demo
**Public frontend URL:** [https://stock-tracker-frontend-aagp.onrender.com/](https://stock-tracker-frontend-aagp.onrender.com/) **(Services may take some time to wake up)**

![Demo](./demo.gif)


# Architecture 
Although I am normally more comfortable working with C#, Angular, and SQL Server, for this project I intentionally chose simpler
and lighter tools better suited to the nature of the task. I chose Node.js with Express, PostgreSQL, and a plain HTML/CSS/JavaScript frontend.
This allowed me to focus on demonstrating the core concepts involved in solving the task, without including any extra fluff that comes
with using large frameworks. It also meant it was a great learning experience, rather than just repeating stuff I've done in the past.

## Frontend
- Plain HTML, CSS and JavaScript
- Simple interface for:
    - Saving the latest Apple stock price
    - Viewing all saved Apple stock prices
- Communicates with the backend API using "fetch"
- Served with Nginx

## Backend (API)
- Node.js + Express.js API server
- POST /prices/:symbol/sync/latest
    - Fetches the latest stock price from the public stock API and stores it in the database
- GET /prices/:symbol
    - Retrieves stored stock prices from the database
- Database access managed through the "pg" package using connection pooling

## Backend (Database)
- Postgres database with a single table: **stock_prices**
- Docker volumes are used to persist data locally (as containers are stateless)
- The database itself is a persistent database when deployed on Render
- stock_prices schema:
    ```sql
    CREATE TABLE stock_prices (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL,
        trading_date DATE NOT NULL,
        open NUMERIC(12,4),
        high NUMERIC(12,4),
        low NUMERIC(12,4),
        close NUMERIC(12,4),
        volume BIGINT,
        UNIQUE(symbol, trading_date)
    );
    ```
- Schema choice rationale:
    - Simple
        - The task at hand has very simple requirements, meaning there is no need to over design. This table has everything we need.
        - Saying that, when it is cheap and easy to plan for potential extensibility, it should be done
        - For example, why are we storing "symbol" when it will always be "AAPL"?
        - Alternatively, we could have a table called apple_stock_prices and not care about the symbol anymore
        - But this could pin us down in terms of future development as requirements change
        - Therefore, I opted to keep it in there
    - UNIQUE(symbol, trading_date)
        - Prevents duplicate data as we are recording by the day
        - Endpoint can be called multiple times and it won't affect the data stores
    - NOT NULLs
        - symbol and trading_date 
        - Without either of these, the data is meaningless
    - OHLCV (Open, High, Low, Close, Volume) - Numeric(12, 4) and BIGINT types
        - Sufficient size to hold any data we may receive
        - These can be null as some data received from free public APIs may not be perfect
        - OHLCV data as separate columns per day is useful for analytics and trends of stocks

## Containers (local)
- All three components (Frontend, API, Database) are run in separate Docker containers locally, orchestrated using Docker Compose
- Their container ports are mapped to the same host ports 80, 3000, 5432 respectively
- The frontend communicates with the API via its host machine port, as requests are made from the browser on the host machine
- Whereas the API communicates with the database within the docker network using TCP on 5432. However, 5432 is still mapped for local development

## Containers (deployed)
- On render the containers are not running on the same host, meaning they communicate using the external URLs of each service

# What Works
- A simple data schema that effectively balances simple requirements with the ability to extend in the future
- Apple stock data is fetched and stored through this pipeline:
Frontend requests -> Backend API fetches from public stock API -> Backend API stores in database
- Minimal frontend displays stored Apple stock prices through this pipeline:
Frontend requests -> Backend API queries database -> Backend API returns data -> Frontend displays data
- Containerised services run locally with minimal setup, including frontend, backend API, and database
- Project is deployed on Render and accessible from a public URL
- Partial CI/CD: Automated builds and deployments on Render occur when commits are made to the main branch.

# What Doesn't Work / Improvements
- All of the main tasks have been addressed, but there are improvements that could be made which I will go into now
- Full CI/CD - Although there are automated builds and deployments with Render, improvements could include:
    - Automated testing (Unit tests, Integration tests, Basic UI rendering tests)
    - Linting
    - Automatic rollbacks on deployment fail
- Authentication / API rate limiting
    - Currently anyone can use the frontend to call the API as much as they'd like.
    - This also means the public stocks API can be called too much (which does have a rate limiter)
    - The backend API is currently open to calls from anywhere (cors is completely enabled)
- A better way of managing the database creation
    - Currently the backend server handles the creation of tables in the database on startup
    - Some kind of initialisation script or migrations framework may be better
- Deployment Improvements
    - Deployment may currently be overengineered
    - Multiple containers running for a simple ingest/store/display pipeline is quite overkill
- Functionality improvements
    - Currently provides limited functionality, only getting the latest Apple stock price
    - Could provide more options e.g. Apple stock on a user-specified date

# Running the project Locally
## Prerequisites
Make sure you have the following installed on your machine:
- **Git**
- **Docker**
- **Docker Compose**

## Steps

1. Open a terminal and navigate to where you would like the project stored on your machine
2. Clone the repository
    ```sh
    git clone https://github.com/jacobguest/stock-tracker-demo.git
    ```
3. Open the cloned project folder in a text editor of your choice
4. Sign up for a free stocks API key from Alpha Vantage at [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
5. Replace the placeholder "REAL_KEY_GOES_HERE" in the docker-compose.yml file with your API key and save the file
6. Open a terminal, navigate to the root of the project and run:
    ```sh
    docker compose up --build -d
    ```
7. The services will now be running in containers on your machine
8. Go to http://localhost on a browser to access the frontend and see the project's functionality

## Additional Information
- The API can be accessed at http://localhost:3000 with a browser or a tool like Postman
- The database can be accessed using a tool like psql:
```sh
psql -h localhost -p 5432 -U postgres -d stock-tracker-db
```
- To stop the containers running, run:
```sh
docker compose down
```
- Volumes are created for local development to provide you with a persistent data store when the database container is not running
- If you don't want them, you can comment out the volumes related code in the docker-compose
- If you want to delete a volume for a fresh run (It will be recreated on rebuild) you can do this:
    ```sh
    docker compose down 
    docker volume ls
    docker rm volume_name
    ```

# Deploying the project on Render
## Steps
1. [Sign up for a Render account](https://dashboard.render.com/register)
2. [Navigate to the Blueprints section](https://dashboard.render.com/blueprints) and create a new blueprint instance
3. Use the public URL of this repository: https://github.com/jacobguest/stock-tracker-demo.git and give your blueprint a name like stock-tracker-demo
4. You will be prompted to provide an ALPHAVANTAGE_API_KEY environment variable. See below
4. Sign up for a free stocks API key from Alpha Vantage at [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
6. After hitting deploy, the project should be deployed on Render within a few minutes
7. The public URL for the frontend will be found under the stock-tracker-frontend webservice on Render
8. The UI can sometimes stick on "Deploying...", try refreshing the page or moving around the website