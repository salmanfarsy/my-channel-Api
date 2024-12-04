// const apiKey = 'AIzaSyBTrQxLnUKsFHR2IFoXcyHiUtrQtVKdR8M';

// fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=UClTWMnTaFQ8eyyPJQ4RK3XQ&key=AIzaSyBTrQxLnUKsFHR2IFoXcyHiUtrQtVKdR8M`)
//   .then(response => response.json())
//   .then(data => {
//     console.log('Channel Data:', data);
//   })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//   });


  const apiKey = 'AIzaSyBTrQxLnUKsFHR2IFoXcyHiUtrQtVKdR8M';
  fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UClTWMnTaFQ8eyyPJQ4RK3XQ&key=AIzaSyBTrQxLnUKsFHR2IFoXcyHiUtrQtVKdR8M`)
  .then(response => response.json())
  .then(data => {
    if (data.items && data.items.length > 0) {
      const subscriberCount = data.items[0].statistics.subscriberCount;
      console.log(`Subscriber Count: ${subscriberCount}`);
      const sub = document.querySelector('.sub');
      sub.textContent = "Subscriber Count : " + subscriberCount + " & Need " + (1000-subscriberCount) + " More To Reach 1000 Subs!!! ";
    } else {
      console.log('No data found for the given channel ID.');
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

const uploadsPlaylistId = 'UUlTWMnTaFQ8eyyPJQ4RK3XQ'; // Replace with actual ID

// fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`)
//   .then(response => response.json())
//   .then(data => {
//     const videos = data.items.map(item => {
//       return {
//         title: item.snippet.title,
//         videoId: item.snippet.resourceId.videoId,
//         videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
//       };
//     });
//     console.log('Videos:', videos);
//   })
//   .catch(error => {
//     console.error('Error fetching video data:', error);
//   });


const loading = document.querySelector('h1');

const maxResults = 50;

// Function to convert ISO 8601 duration to seconds
function convertISO8601ToSeconds(duration) {
  if (duration === 'P0D') {
    console.warn('Skipping video with invalid or zero-length duration (P0D)');
    return 0; // Skip P0D (zero-length) videos
  }

  const match = duration ? duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/) : null;

  if (!match) {
    console.error('Invalid duration format:', duration);
    return 0; // Consider it as 0 if the format is invalid
  }

  const hours = (parseInt(match[1]) || 0) * 3600;
  const minutes = (parseInt(match[2]) || 0) * 60;
  const seconds = parseInt(match[3]) || 0;
  return hours + minutes + seconds;
}

async function fetchAllVideosExcludingShorts(playlistId) {
  let allVideos = [];
  let nextPageToken = '';
loading.style.display = 'block'
  do {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${apiKey}`);
    const data = await response.json();

    if (data.items) {
      const videoIds = data.items.map(item => item.snippet.resourceId.videoId).join(',');

      // Get details of the videos (including description and duration)
      const videoDetailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`);
      const videoDetailsData = await videoDetailsResponse.json();


      const filteredVideos = data.items.filter((item, index) => {
        const videoDetails = videoDetailsData.items[index];

        if (videoDetails && videoDetails.contentDetails && videoDetails.contentDetails.duration) {
          const duration = videoDetails.contentDetails.duration;
          const durationInSeconds = convertISO8601ToSeconds(duration);

         
          // Ensure we exclude videos with duration of 60 seconds or less (Shorts)
          if (durationInSeconds <= 60) {
           
            return false; // Exclude if duration <= 60
          }

          return true; // Include if duration > 60 seconds
        } else {
          console.error(`Missing contentDetails or duration for video ${item.snippet.resourceId.videoId}`);
          return false; // Exclude videos with missing duration
        }
      }).map(item => {
        const videoDetails = videoDetailsData.items.find(v => v.id === item.snippet.resourceId.videoId);
        return {
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
          description: videoDetails ? videoDetails.snippet.description : 'No description available'
        };
      });

      allVideos = allVideos.concat(filteredVideos);
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return allVideos;
}
let topCounter = 10;
let bottomCounter=0;
let storingVideos = '';
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

nextBtn.addEventListener('click',()=>{
topCounter+=10;
bottomCounter+=10;

fetchAllVideosExcludingShorts(uploadsPlaylistId)
  .then(allVideos => {
    storingVideos = allVideos;
    console.log(storingVideos.length)
    storingVideos.filter( (d, i)=> i>bottomCounter && i<topCounter).map( i => puttingThisInHtml(i))
  })
  .catch(error => {
    console.error('Error fetching videos:', error);
  })
  .finally((()=>{
    loading.style.display = 'none'
    
      }))
      ;
    


})

fetchAllVideosExcludingShorts(uploadsPlaylistId)
  .then(allVideos => {
    storingVideos = allVideos;
    console.log(storingVideos.length)
    storingVideos.filter( (d, i)=> i>bottomCounter && i<topCounter && !d.title.includes('#')).map( i => puttingThisInHtml(i))
    
  })
  .catch(error => {
    console.error('Error fetching videos:', error);
  })
  .finally((()=>{
loading.style.display = 'none'

  }))
  ;

const mainElement = document.querySelector('main');
  function puttingThisInHtml(data){
  const card = document.createElement('article');
  const iFrame = document.createElement('iframe');
  iFrame.src = `https://www.youtube.com/embed/${data.videoId}`
  card.appendChild(iFrame);
  iFrame.lazyLoading = true;
    const h3 = document.createElement('h3');
    h3.innerText = data.title;
    card.appendChild(h3);
    mainElement.appendChild(card)
  }

// <iframe width="560" height="315" 
//   src="https://www.youtube.com/embed/FMS8yRekfdg" 
//   frameborder="0" 
//   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
//   allowfullscreen>