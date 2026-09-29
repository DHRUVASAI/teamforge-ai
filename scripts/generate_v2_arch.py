from diagrams import Cluster, Diagram, Edge
from diagrams.onprem.client import Users
from diagrams.programming.framework import React, FastAPI
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python, TypeScript
from diagrams.onprem.compute import Server
from diagrams.aws.ml import Sagemaker

graph_attr = {
    "fontsize": "24",
    "pad": "1.0",
    "nodesep": "1.0",
    "ranksep": "1.5"
}

with Diagram("TeamForge AI v2 - Tri-Engine Agentic Architecture", show=False, filename="TeamForge_v2_Architecture", outformat="png", direction="LR", graph_attr=graph_attr):
    
    users = Users("Engineers")
    
    with Cluster("Frontend (Next.js / Vercel)"):
        ui = React("Arcade UI & Mentor Chat")
        demo = React("Interactive AI Simulator")
        
    with Cluster("Backend (FastAPI)"):
        api = FastAPI("API Gateway")
        
        with Cluster("7-Layer Agentic Pipeline"):
            l1 = Python("1. Problem Analyzer")
            l2 = Python("2. Architecture Engine")
            l3 = Python("3. SDLC Engine")
            l4 = Python("4. Tool Evaluator")
            l5 = Python("5. Task Engine")
            l6 = Python("6. Risk/Delivery")
            l7 = Python("7. Playbook Engine")
            
            # Chain them
            l1 >> l2 >> l3 >> l4 >> l5 >> l6 >> l7
            
        with Cluster("Tri-Engine LLM Router (RAD)"):
            router = Python("Load Balancer\n& Fallback Manager")
            fast_pool = Python("Fast Engine\n(2 Keys)")
            context_pool = Python("Context Engine\n(3 Keys)")
            reasoning_pool = Python("Reasoning Engine\n(2 Keys)")
            
            router >> fast_pool
            router >> context_pool
            router >> reasoning_pool

    with Cluster("External AI Providers (Cloud APIs)"):
        groq = Sagemaker("Groq LPU\n(Llama 3.1 70B)")
        gemini = Sagemaker("Google AI Studio\n(Gemini 3.8 Flash)")
        nvidia = Sagemaker("NVIDIA NIM\n(Nemotron 30B)")
        
    with Cluster("Database"):
        db = PostgreSQL("PostgreSQL\n(Schemas, Playbooks)")

    # Flow
    users >> Edge(label="HTTPS") >> ui
    users >> demo
    
    ui >> api
    api >> l1
    
    # Engines to Router
    l1 >> Edge(label="Deep Thinking") >> router
    l2 >> router
    l3 >> router
    l4 >> router
    l5 >> router
    l6 >> router
    l7 >> Edge(label="Heavy Parsing") >> router
    
    # Router to external
    fast_pool >> Edge(label="Instant UI/Chat") >> groq
    context_pool >> Edge(label="Massive Context") >> gemini
    reasoning_pool >> Edge(label="Complex Tradeoffs") >> nvidia
    
    # DB
    l7 >> Edge(label="Save Structured JSON") >> db
    api >> db

