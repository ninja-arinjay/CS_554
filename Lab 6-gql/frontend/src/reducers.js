import { v4 as uuid } from "uuid";
const initalState = [
  {
    id: uuid(),
    name: "Arinjay",
    character: [],
    isSelected: true,
  },
];

let copyState = null;
let index = 0;

const reducer = (state = initalState, action) => {
  const { type, payload } = action;

  switch (type) {
    case "CREATE_COLLECTOR":
      return [...state, { name: payload.name, character: [], isSelected: false }];
    case "DELETE_COLLECTOR":
      return state.filter((collector) => collector.id !== payload.id);
    case "SELECT_COLLECTOR":
      return state.map((collector) => {
        if (collector.id === payload.id) {
          return { ...collector, isSelected: true };
        } else {
          return { ...collector, isSelected: false };
        }
      });
    case "ADD_CHARACTER":
      copyState = [...state];
      index = copyState.findIndex((collector) => collector.isSelected);
      copyState[index].character.push({
        characterName: payload.characterName,
        characterId : payload.characterId
      });
      return copyState;
    case "DELETE_CHARACTER":
      copyState = [...state];
      index = copyState.findIndex((collector) => collector.isSelected);
      copyState[index].character = copyState[index].character.filter(
        (c) => c.characterName !== payload.characterName
      );
      return copyState;
    default:
      return state;
  }
};

export default reducer;