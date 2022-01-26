import React from 'react';
import styled from 'styled-components';
import { GithubContext } from '../context/context';
import { ExampleChart, Pie3D, Column3D, Bar3D, Doughnut2D } from './Charts';

const Repos = () => {
  const { repos } = React.useContext(GithubContext);
  //console.log(repos);
  const languages = repos.reduce((total, item) => {
    //destructure properties out of repo item
    const { language, stargazers_count } = item;
    if (!language) return total; //if language is not null, then return total
    if (!total[language]) {   //if count of language is null or does not exist,then return 1
      total[language] = { label: language, value: 1, stars: stargazers_count };
    } else {
      total[language] = {
        ...total[language],
        value: total[language].value + 1,
        stars: total[language].stars + stargazers_count,
      };//else return the count
    }
    //console.log(total);
    return total;
  }, {})
  //convert object back into array, and sort to return values which have highest value
  //return the most popular languages
  const mostUsed = Object.values(languages).sort((a, b) => {
    return b.value - a.value;
  }).slice(0, 5);

  const mostPopular = Object.values(languages).sort((a, b) => {
    return b.stars - a.stars;
  }).map((item) => {
    return { ...item, value: item.stars };//assign star value to value property
  })
    .slice(0, 5);

  // most stars per language
  let { stars, forks } = repos.reduce((total, item) => {
    const { stargazers_count, name, forks } = item;
    total.stars[stargazers_count] = { label: name, value: stargazers_count };
    total.forks[forks] = { label: name, value: forks };
    return total;
  }, {
    stars: {},
    forks: {}  //returning stars and forks object from reduce
  })
  //console.log(stars);
  //convert stars and forks object to array
  stars = Object.values(stars).slice(-5).reverse();//get last 5 elements and display it in reverse order
  forks = Object.values(forks).slice(-5).reverse();
  //console.log(forks);

  // const chartData = [
  //   {
  //     label: "Venezuela",
  //     value: "290"
  //   },
  //   {
  //     label: "Saudi",
  //     value: "260"
  //   },
  //   {
  //     label: "Canada",
  //     value: "180"
  //   },
  //   {
  //     label: "Iran",
  //     value: "140"
  //   },

  // ];
  return (
    <section className='section'>
      <Wrapper className='section-center'>
        <Pie3D data={mostUsed} />
        <Column3D data={stars} />
        <Doughnut2D data={mostPopular} />
        <Bar3D data={forks} />
      </Wrapper>
    </section>

  )
}

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 2rem;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 3fr;
  }

  div {
    width: 100% !important;
  }
  .fusioncharts-container {
    width: 100% !important;
  }
  svg {
    width: 100% !important;
    border-radius: var(--radius) !important;
  }
`;

export default Repos;
