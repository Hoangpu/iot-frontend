const axios = require('axios');

axios.get('http://localhost:8080/api/history', { params: { page: 0, size: 10, sortBy: 'time', sortDir: 'desc' } })
  .then(res => console.log(Object.keys(res.data), res.data.content ? res.data.content.length : 0))
  .catch(err => console.error(err.message));
