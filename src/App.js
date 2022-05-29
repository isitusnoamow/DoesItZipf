import './App.css';
import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Bar } from 'react-chartjs-2';
import chartTrendline from 'chartjs-plugin-trendline';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import createTrend from 'trendline';

let frequency = [];
ChartJS.defaults.color = "#fff";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  chartTrendline,
);


function currentText(text) {
  frequency = [];
  text = text.toLowerCase().replace(/[\W_]+/g," ")
  text.split(" ").forEach(function(word, i, arr) {
    if(word !== "") {
      if(frequency.find( ({ name }) => name ===  word ) === undefined){
        frequency.push({name: word, count: 1, rank: 0});
      }else{
        frequency.find( ({ name }) => name === word ).count++;
      }
    }
  });
  frequency.sort(function(a, b) {
    return b.count - a.count;
  });
  frequency.forEach(function(word,i,arr) {
    word.rank = i+1;
  })
  console.log(frequency);
  return frequency;
}


function TextField() {
    const [value, setValue] = useState('');
    const [log, setLog] = useState(false);
    
    const data = {
      labels: currentText(value).map((obj) => obj.name),
      datasets: [{
        label: 'frequency',
        backgroundColor: 'rgb(255, 99, 132)',
        data: currentText(value).map((obj) => obj.count),
      }],
      
    }

    const options = {
      scales: {
        x: {
          grid: {
            borderColor: 'white',
            drawOnChartArea: false
          },
        },
        y: { 
          grid: {
            borderColor: 'white',
            drawOnChartArea: false
          }
        }
      },
      
      plugins: {
        title: {
          display: true,
          text: 'Frequency of Words in Descending Order',
          font: {
            size: 30
          },
        },
        zoom: {
          limits: {
            y: {min: 0, minRange: 1},
          },
          pan: {
            enabled: true,
            mode: 'xy',
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'xy',
          }
        }, 
      }
    }
    const barchart = useRef(null);
    const resetZoom = () => { barchart.current.resetZoom(); }
    const logdata = currentText(value).map(obj => ({ x : Math.log(obj.rank), y : Math.log(obj.count), name: obj.name })); 
    const trend = createTrend(logdata,'x','y');
    const trendline = (logdata.length > 0 ? [
      {x: logdata[0].x, y: trend.calcY(logdata[0].x)},
      {x: logdata[logdata.length-1].x, y: trend.calcY(logdata[logdata.length-1].x)},
    ] : []);

    return (
        <div>
          <textarea
            placeholder="Copy and Paste or Type your text here"
            onChange={e => (setValue(e.target.value))}
          />
          <div className='graphArea'>
            { log ? 
            <>
            <h3>ln(Rank) vs ln(Frequency)</h3>
            <ResponsiveContainer width="100%" aspect="2" className="lnGraph">
            <ComposedChart data={logdata} 
              width={400}
              height={400}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="ln(Rank)" />
              <YAxis type="number" dataKey="y" name="ln(Frequency)" />
              <Line data={trendline} dataKey="y" strokeWidth={3} dot={false}></Line>
              <Scatter data={logdata} fill="#8884d8" />
              <LabelList dataKey="name" position="insideTopRight" />
            </ComposedChart>
          </ResponsiveContainer>
          <p>The slope is {trend.slope}, the closer it is to -1 the more zipf</p>
          </>
            
            
            : <>
            <Bar ref={barchart} data={data} options={options}/>
            <button className='btn-grad' onClick={resetZoom}>Reset Zoom</button>
            </>
            }
          </div>
          
          
          { log ? 
          <button className='btn-grad' 
          onClick={() => setLog(!log)}
          >Switch to Bar</button>  
          :
          <button className='btn-grad' 
          onClick={() => setLog(!log)}
          >Switch to ln</button>
         }
          
        </div>
    );

}



function App() {
  return (
    <div className="App">
      <header className="App-header">
      <h1>Does it Zipf?</h1>
      <p>Copy and paste your text below to find if it follows <a href="https://en.wikipedia.org/wiki/Zipf's_law">Zipf's Law</a></p>
        <TextField />
      </header>
    </div>
  );
}

export default App;
