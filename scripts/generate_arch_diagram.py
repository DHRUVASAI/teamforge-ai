from diagrams import Cluster, Diagram
from diagrams.onprem.client import Users
from diagrams.programming.framework import React, FastAPI
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python

with Diagram("TeamForge Platform - Architecture", show=False, filename="TeamForge_Architecture", outformat="png"):
    users = Users("Hackathon Teams")
    
    with Cluster("Frontend (Next.js 14)"):
        client = React("React App Router")
        
    with Cluster("Backend (FastAPI Engine)"):
        api = FastAPI("API Router")
        ps_engine = Python("PS Evaluator Engine")
        playbook_engine = Python("Playbook Generator")
        tool_eval = Python("Tool Evaluation Logic")
        
        api >> ps_engine
        api >> playbook_engine
        api >> tool_eval
        
    with Cluster("Data & Storage"):
        db = PostgreSQL("PostgreSQL Database")
        
    with Cluster("Intelligence Layer"):
        llm = Python("LLM Engine (Mock / OpenAI)") 
        
    users >> client
    client >> api
    
    ps_engine >> db
    playbook_engine >> db
    tool_eval >> db
    
    ps_engine >> llm
    playbook_engine >> llm
    tool_eval >> llm

