import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {Link} from 'react-router-dom';
import '../App.css';
import { Button} from "@mui/material";
import {Delete} from "@mui/icons-material";


const Collector = () => {
  //const { page } = useParams();
  const dispatch = useDispatch();
  const collectors = useSelector((state) => state);
  // for (let x in rawCollectors) {
  //   if(x === '_persist'){
  //     delete rawCollectors['_persist'];
  //   }
  // }
  // const collectors = rawCollectors;
  // console.log(collectors);
  //const selectedCollector = collectors.find((c) => c.isSelected);
  const [addCollector, setAddCollector] = useState(false);
  const [collectorName, setCollectorName] = useState("");
  //console.log(collectors);

  //console.log(collectors);

  const listOfCharacters = (collector) => {
    return collector.character.map((c) => (
      <div key={c.characterId} className="character-container">
        <Link to={`/marvel-characters/${c.characterId}`}>
          <p className="character-name">{c.characterName}</p>
        </Link>
          <Button
            onClick={() => {
              dispatch({
                type: "DELETE_CHARACTER",
                payload: { characterName: c.characterName },
              });
            }}
            startIcon={<Delete />} style={{ color: 'red' }}
            className="give-up-button" >
            Give-Up
          </Button>
      </div>
    ));
  };

  const listOfCollectors = collectors?.map((c) => (
    <div>
      <div>
        <h2>{c.name}</h2>
        {listOfCharacters(c)}
      </div>
      {!c.isSelected ? (
        <button className="collector-Button"
          onClick={() => {
            dispatch({
              type: "SELECT_COLLECTOR",
              payload: { id: c.id },
            });
          }}
        >
          Select Collector
        </button>
      ) : (
        <p style={{color: 'red', fontWeight: 'bold'}}>Selected Collector</p>
      )}
      {!c.isSelected && (
        <button className="collector-Button"
          onClick={() => {
            dispatch({
              type: "DELETE_COLLECTOR",
              payload: { id: c.id },
            });
          }}
        >
          Delete Collector
        </button>
      )}
    </div>
  ));

  return (
    <div className="main">
      <div>
        {!addCollector ? (
          <button className="collector-Button"
            onClick={() => {
              setAddCollector(true);
            }}
            style={{ padding: "20px 50px", marginBottom: "20px" }}
          >
            Add Collector
          </button>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Collector Name"
              onChange={(e) => {
                e.preventDefault();
                setCollectorName(e.target.value);
              }}
            />
            <button className="collector-Button"
              onClick={() => {
                if (collectorName.trim() !== '') {
                  dispatch({
                    type: "CREATE_COLLECTOR",
                    payload: { name: collectorName },
                  });
                setCollectorName('');
                setAddCollector(false);
              }
              }}
            >
              Add Collector
            </button>
          </div>
        )}
      </div>
      <div>{listOfCollectors}</div>
    </div>
  );
};

export default Collector;