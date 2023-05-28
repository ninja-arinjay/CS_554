const createCollector = ({ name }) => ({
    type: "CREATE_COLLECTOR",
    payload: { name },
  });
  
  const deleteCollector = ({ id }) => ({
    type: "DELETE_COLLECTOR",
    payload: { id },
  });
  
  const selectCollector = ({ id }) => ({
    type: "SELECT_COLLECTOR",
    payload: { id },
  });
  
  const addCharacter = ({ characterName, characterId }) => ({
    type: "ADD_CHARACTER",
    payload: { characterName, characterId },
  });
  
  const deleteCharacter = ({ characterName }) => ({
    type: "DELETE_CHARACTER",
    payload: { characterName },
  });