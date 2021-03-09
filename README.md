# IDM Vision

SAP IDM content browser and system monitoring

(c) 2020 Volker Hehl

Licence: MIT


## Requirements

* Windows (other OS may work too)
* Git
* Node.js V10.15.x or higher
* Node.js build tools
* SAP IDM V7.2 or V8 (other versions may work too)
* Currently only MSSQL server supported!


## Jump Start

Running IDM Vision locally, **accessible without any authentication!**


### Install

Ensure you have Node.js and build tools installed.

```bash
clone https://github.com/volkerhehl/IDM-Vision.git
cd IDM-Vision
npm install
```

### Configure

Create config files from samples

```bash
cd config
copy idms-sample.yaml idms.yaml
copy main-sample.yaml main.yaml
```

Edit IDM DB connection(s) in: ```config/idms.yaml```

```yaml
idp:
  name: IDP
  description: IDP - Production
  realm: prod
  dbtype: mssql
  dbconfig:
    server: sqldb-server-hostname
    database: IDP_db
    user: IDP_user
    password: password***
```

### Run

```bash
cd ..
node app
```

Open localy: [http://127.0.0.1:7000](http://127.0.0.1:7000)
