import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../_Firebase/firebaseConfig';

function DashboardIndividual() {
    
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(db, 'course_results');
        const unsubscribe = onSnapshot(dataCollection, (snapshot) => {
          const newData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort data based on the sum of scores in descending order
          newData.sort((a, b) => b.scores.sum - a.scores.sum);

          setData(newData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (studentData) => {
    const { scores } = studentData;

    return {
      lineChart: {
        chart: {
          id: 'line-chart',
          type: 'line',
        },
        xaxis: {
          categories: ['Question 1', 'Question 2', 'Question 3', 'Question 4', 'Question 5'],
        },
        yaxis: {
          min: 0,
          max: 5.0,
        },
        series: [
          {
            name: 'Scores',
            data: [
              scores[1],
              scores[2],
              scores[3],
              scores[4],
              scores[5],
            ],
          },
        ],
      },
      barChart: {
        chart: {
          id: 'bar-chart',
          type: 'bar',
        },
        xaxis: {
          categories: ['Average', 'Sum'],
        },
        yaxis: {
          min: 0,
          max: 30,
        },
        series: [
          {
            name: 'Averages',
            data: [scores.average, scores.sum],
          },
        ],
      },
    };
  };

  const getAverageScores = () => {
    return data.map((student) => student.scores.average);
  };

  const getSumScores = () => {
    return data.map((student) => student.scores.sum);
  };

  const renderRankingTable = () => {
    return (

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rank</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Sum of Scores</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student, index) => (
            <tr key={student.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{index + 1}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.displayName}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.scores.sum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  

  return (
    <div className='rightPane' style={{ alignItems: 'center' }}>
      {loading || !data.length ? (
        <div className="">Loading...</div>
      ) : (
        <>
          <h2>Providing Analytics for : {data[0]['course_name']} Assessment</h2>

          

          {/* Average Scores Chart */}
          <div className="" style={{display:'flex', gap:'60px'}}>
            <div style={{ marginTop: '30px' }}>
              <h2>Average Scores</h2>
              <ReactApexChart
                options={{
                  chart: {
                    id: 'average-chart',
                    type: 'bar',
                  },
                  xaxis: {
                    categories: data.map((student) => student.displayName),
                  },
                  yaxis: {
                    max: 5.0,
                  },
                }}
                series={[
                  {
                    name: 'Average Scores',
                    data: getAverageScores(),
                  },
                ]}
                type='bar'
                height={350}
              />
            </div>

            {/* Sum of Scores Chart */}
            <div style={{ marginTop: '30px' }}>
              <h2>Total Scores</h2>
              <ReactApexChart
                options={{
                  chart: {
                    id: 'sum-chart',
                    type: 'bar',
                  },
                  xaxis: {
                    categories: data.map((student) => student.displayName),
                  },
                }}
                series={[
                  {
                    name: 'Sum of Scores',
                    data: getSumScores(),
                  },
                ]}
                type='bar'
                height={350}
              />
            </div>
          </div>

          {/* Ranking Table */}
          <div style={{ marginTop: '30px' }}>
            <h2>Ranking Among the Class</h2>
            {renderRankingTable()}
          </div>

            <h2 style={{marginTop:'60px'}}>Student Wise Analytics</h2>
          <div style={{ display: 'flex', gap: '100px', marginTop: '30px' }}>
            {data.map((student) => (
              <div key={student.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={student.photo} className='creator-icon' alt="" />
                  <h3>{student.displayName}</h3>
                </div>
                {student.scores && (
                  <>
                    <ReactApexChart options={getChartData(student).lineChart} series={getChartData(student).lineChart.series} type='line' height={350} />
                    <ReactApexChart options={getChartData(student).barChart} series={getChartData(student).barChart.series} type='bar' height={350} />
                  </>
                )}
              </div>
            ))}
          </div>


        </>
      )}
    </div>
  );
}

export default DashboardIndividual;
