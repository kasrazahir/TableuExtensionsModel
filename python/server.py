from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
import pandas as pd
import seaborn as sns
import json
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest

import logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)
data = pd.DataFrame()

def makeGraph(data):
  df= pd.DataFrame()
  df['x'] = pd.to_numeric(data['x'])
  df['y'] = pd.to_numeric(data['y'])
  df['cluster'] = pd.to_numeric(data['cluster'])
  sns_plot = sns.lmplot('x','y',df, fit_reg=False, hue="cluster", legend=False)
  sns_plot.savefig("../extension/fig.png")

  print('data in graph', data.head())
  # fig = plt.figure()
  # plt.scatter(df['x'], df['y'], c=df['cluster'], cmap='coolwarm')
  # plt.xticks([])
  # plt.yticks([])
  # fig.savefig('../extension/fig.png', dpi=fig.dpi)  


@app.route("/initial", methods=['GET', 'POST'])
def initial():
  global data 
  data = pd.DataFrame(request.get_json())
  print('initializing', data.head())
  makeGraph(data)
  return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

@app.route("/outlier", methods=['GET'])
def outlier():
  global data;
  IF = IsolationForest()
  print('DATA R', data.head())
  IF.fit(data[['x','y']])
  ifpred = IF.predict(data[['x','y']])
  data['ifpred']=ifpred
  data.loc[data.ifpred <0, 'cluster']=4
  makeGraph(data)
  return json.dumps({"success":True}), 200, {"ContentType":"application/json"}


@app.route("/cluster", methods=['GET'])
def cluster():
  global data;
  print('clustering', data.head())
  kmeans = KMeans(n_clusters=2, random_state=0)
  kpred = kmeans.fit_predict(data[['x','y']])
  data['cluster']=kpred
  makeGraph(data)
  return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

@app.route("/reset", methods=['GET'])
def reset():
  global data;
  print('reset', data.head())
  data['cluster']=0
  makeGraph(data)
  return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

@app.route("/save", methods=['GET'])
def save():
  global data;
  print('save', data.head())
  data.to_csv("../scatter.csv")
  return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=600)
