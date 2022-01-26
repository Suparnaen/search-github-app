import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext(); //this is a context

//here we will setup only provider and not consumer, We are not calling GithubContext.Provider directly
//since we want to setup other functionalities/logic, we will call provider via separate component(GithubProvider)
//provider, consumer - GithubContext.Provider
const GithubProvider = ({ children }) => {  //whole application is children
    const [githubUser, setGithubUser] = useState(mockUser);
    const [repos, setRepos] = useState(mockRepos);
    const [followers, setFollowers] = useState(mockFollowers);
    //request loading
    const [requests, setRequests] = useState(0)
    const [isLoading, setIsLoading] = useState(false);
    // error
    const [error, setError] = useState({ show: false, msg: '' });

    //function to search user
    const searchGithubUser = async (user) => {
        toggleError();
        //setIsLoading true-implement loading of screen while waiting for user to load
        setIsLoading(true);
        const response = await axios(`${rootUrl}/users/${user}`)
            .catch((err) => console.log(err));
        console.log(response);
        if (response) {
            setGithubUser(response.data);
            const { login, followers_url } = response.data;
            //more logic here
            //repos  https://api.github.com/users/john-smilga/repos?per_page=100
            // axios(`${rootUrl}/users/${login}/repos?per_page=100`)
            //     .then((response) => setRepos(response.data));
            // //followers https://api.github.com/users/john-smilga/followers
            // axios(`${followers_url}?per_page=100`)
            //     .then((response) => setFollowers(response.data));
            //implement promise.allsettled to handle synchronization of results fetched after quering
            await Promise.allSettled([axios(`${rootUrl}/users/${login}/repos?per_page=100`),
            axios(`${followers_url}?per_page=100`)])
                .then((results) => {
                    const [repos, followers] = results;
                    const status = 'fulfilled';
                    if (repos.status === status) {
                        setRepos(repos.value.data);
                    }
                    if (followers.status === status) {
                        setFollowers(followers.value.data);
                    }
                }).catch((err) => console.log(err));

        } else {
            toggleError(true, 'there is no user with that username.');
        }
        //once user is loaded, reset setIsLoading to false
        checkRequests();
        setIsLoading(false);
    }

    //check rate limit
    const checkRequests = () => {
        axios(`${rootUrl}/rate_limit`)
            .then(({ data }) => { //destructure data since it is one of the property in rate json
                console.log(data);
                let { rate: { remaining }, } = data;  //destructure remaining attribute
                //remaining = 0; to simulate error message uncomment this line
                setRequests(remaining);//search button dissapear when remaining is 0 or rate limit exceeds
                if (remaining === 0) {
                    toggleError(true, 'sorry, you have exceeded your hourly rate limit!');
                }

            }).catch((err) => { console.log(err) });
    }
    function toggleError(show = false, msg = '') {
        setError({ show, msg });
    }

    //error for 2 scenario--if user does not exist and if rate limit is exceeded

    useEffect(() => {
        checkRequests()
    }, [])

    return (
        <GithubContext.Provider value={{ githubUser, repos, followers, requests, error, searchGithubUser, isLoading }}>
            {children}
        </GithubContext.Provider>
    )
};

export { GithubProvider, GithubContext };

/**
 * GithubProvider is used to wrap the application
 * GithubContext is used to access the value
 * pass the mock data as value in GithubContext.Provider, so now object is setup
 * this can be accessed from Info.js or any other componenets   
 */