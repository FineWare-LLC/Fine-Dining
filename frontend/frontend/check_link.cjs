const mui = require('@mui/material');

console.log('Link:', mui.Link);
if (mui.Link) {
    console.log('Link $$typeof:', mui.Link.$$typeof);
    console.log('Link render:', !!mui.Link.render);
}
