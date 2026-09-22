# DB Report and Chat Server

DB Report and Chat is an application designed to facilitate seamless communication with your database. It allows users to interact with their database using natural language queries, making database management and data retrieval more intuitive and user-friendly.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* Visual Studio 2026 installed locally
* Visual Studio Code
* SQL Server 
* The [.NET 8.0 SDK](https://dotnet.microsoft.com/download) installed locally
* You have access to one or more compatible database (SQL Server, MySQL, PostgreSQL, Oracle)
* You have access keys or identity access of the supported AI platforms (platform.openai.com, console.groq.co, platform.claude.com)

  * Azure OpenAI
  * OpenAI
  * Ollama

## Download Source code

To download/clone the source code onto your local computer:

&#x20;   ```sh
    git clone https://github.com/sandippatil2000

&#x20;   ```

## Create AIDB

Install SQL Server on local machine:



Open SQLScript\\AIDB.sql script and run on local SQL Server to create AIDB dataset.

This Db is used to store config and report resords



## Configure the AIDbAPI Project 

You'll need to authenticate to one of the supported AI platforms to use the app.

To configure a connection to your desired AI platform, provide a value for one or more of the following settings in the `appsettings.json` file:

&#x20;   ```json
    "AZURE\_OPENAI\_ENDPOINT": "", 
    "OPENAI\_KEY": "",
    "OLLAMA\_ENDPOINT": "",
    "GITHUB\_MODELS\_KEY": "",
    "AWS": {
        "Region": "",
        "Profile": ""
    }
    ```

