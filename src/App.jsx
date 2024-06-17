import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Progress,
} from "reactstrap";

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [types, setTypes] = useState([]);

  const toggle = () => setModal(!modal);

  const fetchPokemon = async () => {
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      );
      const { results } = response.data;

      const pokemonData = await Promise.all(
        results.map(async (pokemon) => {
          const pokemonResponse = await axios.get(pokemon.url);
          return {
            id: pokemonResponse.data.id,
            name: pokemonResponse.data.name,
            image: pokemonResponse.data.sprites.front_default,
            types: pokemonResponse.data.types.map((type) => type.type.name),
            abilities: pokemonResponse.data.abilities.map(
              (ability) => ability.ability.name
            ),
            stats: pokemonResponse.data.stats.map((stat) => ({
              name: stat.stat.name,
              value: stat.base_stat,
            })),
          };
        })
      );

      setPokemonList((prev) =>
        offset === 0 ? pokemonData : [...prev, ...pokemonData]
      );
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get("https://pokeapi.co/api/v2/type");
      setTypes(response.data.results);
    } catch (error) {
      console.error("Error fetching Pokémon types:", error);
    }
  };

  const loadMore = () => {
    setOffset((prevOffset) => prevOffset + 20);
    setLimit((prevLimit) => prevLimit + 20);
  };

  const detailPokemon = (id) => {
    const pokemon = pokemonList.find((pokemon) => pokemon.id === id);
    setSelectedPokemon(pokemon);
    toggle();
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const filteredPokemonList = selectedType
    ? pokemonList.filter((pokemon) => pokemon.types.includes(selectedType))
    : pokemonList;

  useEffect(() => {
    fetchPokemon();
    fetchTypes();
    if (selectedType !== "") {
      setLimit(1000000);
    }
  }, [offset, limit, selectedType]);

  return (
    <Container className="bg-light">
      <Modal isOpen={modal} centered toggle={toggle}>
        <ModalHeader toggle={toggle}>{selectedPokemon?.name}</ModalHeader>
        <ModalBody>
          {selectedPokemon && (
            <>
              <Row>
                <Col md={4}>
                  <div className="border d-flex justify-content-center">
                    <img
                      src={selectedPokemon.image}
                      alt={selectedPokemon.name}
                      className="img-fluid"
                    />
                  </div>
                  <div className="d-flex justify-content-center mt-3 text-capitalize ">
                    <h5>{selectedPokemon?.name}</h5>
                  </div>
                </Col>
                <Col md={8}>
                  <h5 className="text-muted">Types</h5>
                  <p>{selectedPokemon.types.join(", ")}</p>
                  <h5 className="text-muted">Abilities</h5>
                  <p>{selectedPokemon.abilities.join(", ")}</p>
                  <h5 className="text-muted">Statistics</h5>
                </Col>
                <hr />
              </Row>
              <Row>
                <ul className="list-unstyled">
                  {selectedPokemon.stats.map((stat) => (
                    <li key={stat.name} className="mb-3">
                      <Row className="align-items-center">
                        <Col md={3}>
                          <span>{stat.name}</span>
                        </Col>
                        <Col md={7}>
                          <Progress color="info" striped value={stat.value} />
                        </Col>
                        <Col md={2} className="text-end">
                          <div>
                            <span className="rounded-circle p-2 border">
                              {stat.value}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </li>
                  ))}
                </ul>
              </Row>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" outline size="lg" block onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <h1 className="text-center my-4">Pokémon List</h1>
      <FormGroup>
        <Label for="typeSelect">Filter by Type</Label>
        <Input
          type="select"
          name="select"
          id="typeSelect"
          value={selectedType}
          onChange={handleTypeChange}
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </Input>
      </FormGroup>
      <Row>
        {filteredPokemonList.map((pokemon) => (
          <Col key={pokemon.id} md={3} className="mb-4">
            <div className="card">
              <img
                src={pokemon.image}
                className="card-img-top"
                alt={pokemon.name}
              />
              <div className="card-body">
                <h5 className="card-title">{pokemon.name}</h5>
                <div>
                  {pokemon.types.map((type, index) => (
                    <span
                      key={index}
                      className="badge bg-light rounded border text-muted me-2"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <Button
                  block
                  color="primary"
                  onClick={() => detailPokemon(pokemon.id)}
                  className="mt-2"
                  outline
                >
                  View
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <Button color="primary" onClick={loadMore} outline block className="my-4">
        Load More
      </Button>
    </Container>
  );
};

export default PokemonList;
