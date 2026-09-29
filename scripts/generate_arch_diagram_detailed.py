from diagrams import Cluster, Diagram, Edge
from diagrams.onprem.client import Users
from diagrams.onprem.network import Nginx
from diagrams.programming.framework import React, FastAPI
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python, TypeScript
from diagrams.custom import Custom
from diagrams.saas.chat import Slack
from diagrams.onprem.compute import Server

# Define global Graphviz attributes for a cleaner look
graph_attr = {
    "fontsize": "20",
    "pad": "0.5",
    "nodesep": "0.8",
    "ranksep": "1.2"
}

with Diagram("TeamForge AI - Detailed Architecture", show=False, filename="TeamForge_Architecture_Detailed", outformat="png", direction="LR", graph_attr=graph_attr):
    
    users = Users("Hackathon Teams\n& Engineers")
    
    with Cluster("Client Layer (Next.js 14)"):
        ui = React("App Router UI")
        auth_context = TypeScript("JWT State Context")
        axios_client = TypeScript("Axios API Client")
        
        ui - auth_context
        ui >> axios_client
        
    with Cluster("Backend Layer (FastAPI)"):
        with Cluster("API Gateway & Security"):
            api_router = FastAPI("REST API Gateway")
            auth_service = Python("JWT & OAuth Guard")
            
        with Cluster("Core Decision Engines"):
            ps_evaluator = Python("Problem Statement\nAnalyzer Engine")
            tool_evaluator = Python("Tool Selection Engine\n(Lazy Architect)")
            playbook_gen = Python("Playbook Generation Engine")
            feasibility_scanner = Python("Feasibility Scanner")
            
        api_router >> auth_service
        api_router >> ps_evaluator
        api_router >> tool_evaluator
        api_router >> playbook_gen
        api_router >> feasibility_scanner
            
    with Cluster("Data Persistence Layer"):
        with Cluster("ORM Layer"):
            sqlalchemy = Python("SQLAlchemy ORM")
            pydantic = Python("Pydantic Schemas")
        db = PostgreSQL("Relational Database\n(Users, Projects, Playbooks)")
        
        sqlalchemy - pydantic
        sqlalchemy >> db
        
    with Cluster("External Intelligence"):
        llm = Server("LLM API\n(OpenAI / Mock Engine)")
        
    # Main Connections
    users >> Edge(label="HTTPS / JSON") >> ui
    axios_client >> Edge(label="REST API") >> api_router
    
    # Engines to Database
    ps_evaluator >> sqlalchemy
    tool_evaluator >> sqlalchemy
    playbook_gen >> sqlalchemy
    feasibility_scanner >> sqlalchemy
    
    # Engines to LLM
    ps_evaluator >> Edge(color="darkblue", style="dashed") >> llm
    tool_evaluator >> Edge(color="darkblue", style="dashed") >> llm
    playbook_gen >> Edge(color="darkblue", style="dashed") >> llm
    feasibility_scanner >> Edge(color="darkblue", style="dashed") >> llm

