import { useEffect, useState } from 'react';
import './App.css';
import {usePost, Algorithm} from './hooks/usePost';
import { ServiceData, ServiceState } from './types/service';

function App() {
  const [gridData, setGridData] = useState<{ [key: number]: { [key: string]: ServiceState } }>({});
  const [allServices, setAllServices] = useState<string[]>([]);
  const [timeSteps, setTimeSteps] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('smms');
  const [postData, loadingPost, postSimulationData] = usePost<ServiceData>('https://edge-sim-py-interface.vercel.app/simulation/services');

  const fetchData = async () => {
    try {
      await postSimulationData({ algorithm, url_or_json: url });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useEffect(() => {
    if (postData?.Service) {
      const grouped: { [key: number]: { [key: string]: ServiceState } } = {};
      const servicesSet: Set<string> = new Set();

      postData.Service.forEach(item => {
        const time = Number(item["Time Step"]);
        if (!grouped[time]) grouped[time] = {};
        grouped[time][item.Object] = item;
        servicesSet.add(item.Object);
      });

      setGridData(grouped);
      setTimeSteps(Object.keys(grouped).sort((a, b) => Number(a) - Number(b)));
      setAllServices([...servicesSet].sort());
    }
  }, [postData]);

  return (
    <div className='container'>
      <div className="controls">
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
        >
          <option value="smms">SMMS</option>
          <option value="thea">Thea</option>
        </select>
        <button onClick={fetchData} disabled={loadingPost}>
          {loadingPost ? 'Loading...' : 'Run Simulation'}
        </button>
      </div>

      {loadingPost ? (
        <div>Carregando dados...</div>
      ) : (
        <div className="grid-container">
          <div className="header-row">
            {timeSteps.map(step => (
              <div className="header-cell" key={step}>T{step}</div>
            ))}
          </div>

          {allServices.map(service => (
            <div className="grid-row" key={service}>
              <div className="row-label">{service}</div>
              {timeSteps.map(step => {
                const data = gridData[Number(step)]?.[service];
                return (
                  <div
                    key={step}
                    className={`grid-cell ${
                      data?.["Being Provisioned"]
                        ? "provisioning"
                        : data?.Server !== null
                        ? "active"
                        : "idle"
                    }`}
                  >
                    {data?.Server ? `S${data.Server}` : data?.["Being Provisioned"] ? 'Prov' : '—'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
