from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import yfinance as yf
from typing import Optional, List, Dict

app = FastAPI()

class CostOfLivingRequest(BaseModel):
    state: Optional[str] = "Unknown"
    city_tier: Optional[str] = "Tier-1"
    pincode: Optional[str] = None

class UserData(BaseModel):
    income: float
    spending: float
    investments: Optional[dict] = None
    isInvestor: str

class SimulationRequest(BaseModel):
    user_class: str
    monthly_investment: float
    years: int

@app.get("/")
def read_root():
    return {"message": "Financial Digital Twin ML Service is running"}

@app.post("/predict_cost_of_living")
def predict_cost_of_living(data: CostOfLivingRequest):
    # Logic: Tier-1 > Tier-2 > Rural
    base_cost = 15000
    if data.city_tier == "Tier-1":
        base_cost = 25000
    elif data.city_tier == "Tier-2":
        base_cost = 18000
    
    # Simple randomness for demo
    estimated_cost = base_cost + np.random.randint(-2000, 2000)
    return {"estimated_cost": estimated_cost}

@app.post("/classify_user")
def classify_user(data: UserData):
    savings = data.income - data.spending
    savings_rate = savings / data.income if data.income > 0 else 0
    
    user_class = "Unknown"

    if data.isInvestor == "no":
        if savings_rate < 0.1:
            user_class = "Survivor" # Struggling to save
        elif savings_rate < 0.3:
             if data.income > 50000:
                 user_class = "YOLO"
             else:
                 user_class = "Survivor"
        else:
            user_class = "Saver" # Saving but not investing
    else:
        investments = data.investments or {}
        # Simple heuristic
        if investments.get('stocks', 0) > 0 or investments.get('crypto', 0) > 0:
            user_class = "Investor"
        else:
            user_class = "Saver"

    return {"user_class": user_class}

@app.get("/market_data")
def get_market_data():
    try:
        # Fetch Nifty 50 and Gold
        nifty = yf.Ticker("^NSEI")
        gold = yf.Ticker("GC=F")
        
        nifty_hist = nifty.history(period="5d")
        gold_hist = gold.history(period="5d")
        
        nifty_price = nifty_hist['Close'].iloc[-1]
        nifty_change = ((nifty_price - nifty_hist['Close'].iloc[0]) / nifty_hist['Close'].iloc[0]) * 100
        
        gold_price = gold_hist['Close'].iloc[-1]
        gold_change = ((gold_price - gold_hist['Close'].iloc[0]) / gold_hist['Close'].iloc[0]) * 100
        
        return {
            "nifty": {"price": round(nifty_price, 2), "change": round(nifty_change, 2)},
            "gold": {"price": round(gold_price, 2), "change": round(gold_change, 2)}
        }
    except Exception as e:
        return {"error": str(e), "nifty": {"price": 22000, "change": 0.5}, "gold": {"price": 2000, "change": 0.1}}

@app.post("/simulate_wealth")
def simulate_wealth(data: SimulationRequest):
    # Monte Carlo Simulation
    # Scenarios: Conservative (FD), Balanced (Index), Aggressive (Equity), Crypto
    
    results = {}
    years = data.years
    monthly_inv = data.monthly_investment
    
    scenarios = {
        "Conservative": {"mu": 0.07, "sigma": 0.02}, # FD-like
        "Balanced": {"mu": 0.12, "sigma": 0.15},    # Nifty 50
        "Aggressive": {"mu": 0.18, "sigma": 0.25}   # Small cap / Crypto mix
    }
    
    simulations = 100
    months = years * 12
    
    for name, params in scenarios.items():
        # simple calculation for demo speed - compounding with volatility
        # Future Value = P * ((1+r)^n - 1) / r  <-- Regular SIP formula
        # We add some noise for MC feel
        
        final_values = []
        for _ in range(simulations):
            total = 0
            for i in range(months):
                # Monthly return with randomness
                monthly_rate = (params["mu"] / 12) + np.random.normal(0, params["sigma"] / np.sqrt(12))
                total = (total + monthly_inv) * (1 + monthly_rate)
            final_values.append(total)
            
        results[name] = {
            "p10": int(np.percentile(final_values, 10)),
            "median": int(np.median(final_values)),
            "p90": int(np.percentile(final_values, 90))
        }
        
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
