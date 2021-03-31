# IDM Vision

SAP IDM content browser and system monitoring

(c) 2020 Volker Hehl

Licence: MIT


## Requirements

* Windows (other OS may work too)
* Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)
* Node.js V12: [https://nodejs.org/en/download/releases/](https://nodejs.org/en/download/releases/) (other versions may work too - V14 currently don't work with the ***node-sspi*** module, if you need V14 but no AD user authentication, delete ```node-sspi``` from ```package.json``` before ```npm install```)
* Node.js build tool chain: check "Tools for Native Modules" during Node.js setup
* SAP IDM V7.2 or V8 (other versions may work too)
* Currently only MSSQL server supported!


## Jump Start

Running IDM Vision locally, **accessible without any authentication!**


### Install

```bash
git clone https://github.com/volkerhehl/IDM-Vision.git
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

Open locally: [http://127.0.0.1:7000](http://127.0.0.1:7000)

## Run as Windows service

### Install service using NSSM

Download NSSM: [https://nssm.cc/download](https://nssm.cc/download)

Create a new service from console

```
nssm install IDM-Vision
```

Fill GUI Fields

* ***Path***: path to Node.js binary, for example: ```C:\Program Files\nodejs\node.exe```
* ***Startup directory***: path to IDM-Vision, for example: ```C:\IDM-Vision```
* ***Arguments***: ```app```

Click ***Install service*** button
