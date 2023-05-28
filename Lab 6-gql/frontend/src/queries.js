import { gql } from "@apollo/client";

const GET_ALL_CHARACTERS = gql`
query Query($pagenum: String!) {
  getAllCharacters(pagenum: $pagenum) {
    id
    image
    name
    comics
    stories
    events
    link
  }
}
`;

const GET_CHARACTER_BY_ID = gql`
query Query($getCharacterByIdId: String!) {
  getCharacterById(id: $getCharacterByIdId) {
    id
    image
    description
    name
    comics
    stories
    events
    series
    link
  }
}
`;

const GET_CHARACTER_BY_NAME = gql`
query Query($search: String!) {
  getCharacterByName(search: $search) {
    id
    image
    name
    comics
    stories
    events
    link
  }
}
`;


export  {
  GET_ALL_CHARACTERS,
  GET_CHARACTER_BY_ID,
  GET_CHARACTER_BY_NAME
};