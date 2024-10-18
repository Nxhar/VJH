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

          // Sort data based on the total score in descending order
          newData.sort((a, b) => b.totalScore - a.totalScore);

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
    const questionScores = Object.values(scores).filter((score) => typeof score === 'number');

    return {
      lineChart: {
        chart: {
          id: 'line-chart',
          type: 'line',
        },
        xaxis: {
          categories: questionScores.map((_, index) => `Question ${index + 1}`),
        },
        yaxis: {
          min: 0,
          max: 5, // Adjust based on your scoring scale
        },
        series: [
          {
            name: 'Scores',
            data: questionScores,
          },
        ],
      },
      barChart: {
        chart: {
          id: 'bar-chart',
          type: 'bar',
        },
        xaxis: {
          categories: ['Average', 'Total'],
        },
        series: [
          {
            name: 'Scores',
            data: [studentData.averageScore, studentData.totalScore],
          },
        ],
      },
    };
  };

  const renderRankingTable = () => {
    return (
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rank</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student, index) => (
            <tr key={student.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{index + 1}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.displayName}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.totalScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className='rightPane' style={{ alignItems: 'center', overflowX: 'auto' }}>
      {loading || !data.length ? (
        <div className="">Loading...</div>
      ) : (
        <>
          <h2>Providing Analytics for: {data[0]['course_name']} Assessment</h2>

          {/* Ranking Table */}
          <div style={{ marginTop: '30px', overflowX: 'auto' }}>
            <h2>Ranking Among the Class</h2>
            {renderRankingTable()}
          </div>

          <h2 style={{ marginTop: '60px' }}>Student Wise Analytics</h2>
          <div style={{ display: 'flex', gap: '100px', marginTop: '30px', overflowX: 'auto' }}>
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
