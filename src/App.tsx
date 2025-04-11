import { useEffect, useState } from "react";
import "./App.css";
import { usePost, Algorithm } from "./hooks/usePost";
import { ServiceData, ServiceState } from "./types/service";
import { Bounce, ToastContainer, toast } from "react-toastify";

function App() {
  const [gridData, setGridData] = useState<{
    [key: number]: { [key: string]: ServiceState };
  }>({});
  const [allServices, setAllServices] = useState<string[]>([]);
  const [timeSteps, setTimeSteps] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("smms");
  const [postData, loadingPost, postError, postSimulationData] =
    usePost<ServiceData>("http://localhost:3000/simulation/services");

  const fetchData = async () => {
    try {
      await postSimulationData({ algorithm, url_or_json: url });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    if (postData?.Service) {
      const grouped: { [key: number]: { [key: string]: ServiceState } } = {};
      const servicesSet: Set<string> = new Set();

      postData.Service.forEach((item) => {
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

  useEffect(() => {
    console.log(loadingPost, postData, postError);
    if (loadingPost) {
      return;
    }
    if (!postData) {
      return;
    }

    if (postError) {
      toast.error(postError);
      setGridData({});
      setTimeSteps([]);
      setAllServices([]);
      return;
    }
    toast.success("Simulation completed successfully!");
  }, [loadingPost, postData, postError]);

  return (
    <div className="container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
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
          {loadingPost ? "Loading..." : "Run Simulation"}
        </button>
      </div>

      {loadingPost ? (
        <div>Carregando dados...</div>
      ) : (
        <div className="grid-container">
          <div className="header-row">
            {timeSteps.map((step) => (
              <div className="header-cell" key={step}>
                T{step}
              </div>
            ))}
          </div>

          {allServices.map((service) => (
            <div className="grid-row" key={service}>
              <div className="row-label">{service}</div>
              {timeSteps.map((step) => {
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
                    {data?.Server
                      ? `S${data.Server}`
                      : data?.["Being Provisioned"]
                      ? "Prov"
                      : "—"}
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
