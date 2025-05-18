const cl = console.log;

const postContainer = document.getElementById('postContainer');
const loader = document.getElementById('loader');
const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const contentControl = document.getElementById('content');
const userIdControl = document.getElementById('userId');
const addPostBtn = document.getElementById('addPostBtn');
const updatePostbtn = document.getElementById('updatePostbtn');


const baseURL = `https://fir-api-call-9c6a1-default-rtdb.firebaseio.com`;
const postURL = `${baseURL}/posts.json`;

const createCards = (arr) => {
    let result = '';

    arr.forEach(post => {
        result += ` <div class="card mb-3" id='${post.id}'>
                        <div class="card-header">
                            <h3>${post.title}</h3>
                        </div>
                        <div class="card-body">
                            <p>${post.content}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn-sm btn btn-outline-info" onclick='onEditPost(this)'>Edit</button>
                            <button class="btn-sm btn btn-outline-danger" onclick='onRemovePost(this)'>Remove</button>
                        </div>
                    </div>`
    });
    postContainer.innerHTML = result;
}

const snackBar = (msg, icon) => {
    swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

const apiCall = async (url, methodName, msgBody) => {
    try{
        msgBody = msgBody ? JSON.stringify(msgBody) : null;

        loader.classList.remove('d-none');

        let res = await fetch(url, {method: methodName,
            body : msgBody,
            headers : {
                Authorization : 'Token',
                'Content-Type' : 'Application/json'
            }
        })
        return res.json();
    }catch(err){
        snackBar('something went wrong', 'error')
    }finally {
        loader.classList.add('d-none');
    }
}

const objToArr = (obj) =>{
    let arr = [];
    for (const key in obj) {
       arr.push({...obj[key], id : key})
    }
    return arr
}

const fetchPost = async () => {
    try{
        let data = await apiCall(postURL, 'GET')
        let postArr = objToArr(data);
        createCards(postArr);
    }
    catch(err) {
        snackBar('Something went wrong while fetchinf Data!!', 'error');
    }
}
fetchPost();

const onAddPost = async (eve) => {
    eve.preventDefault();
    let postObj  ={
        title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value
    }
    cl(postObj);
    eve.target.reset();

   try{
     let data = await apiCall(postURL, 'POST', postObj);

    let card = document.createElement('div');
    card.className = 'card mb-3';
    card.id = data.name;
    
    card.innerHTML = `  <div class="card-header">
                            <h3>${postObj.title}</h3>
                        </div>
                        <div class="card-body">
                            <p>${postObj.content}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn-sm btn btn-outline-info" onclick='onEditPost(this)'>Edit</button>
                            <button class="btn-sm btn btn-outline-danger" onclick='onRemovePost(this)'>Remove</button>
                        </div>`;

    postContainer.append(card);

     snackBar(`New post created successfully with id ${card.id}!!`, 'success');
   }
    catch(err)  {
    snackBar('Something went wrong while creating new Post!!', 'error')
   }  
}

const onEditPost = async (ele) => {
   try{
     let editId = ele.closest('.card').id;
    cl(editId);
    localStorage.setItem('editId', editId);

    let editURL = `${baseURL}/posts/${editId}.json`;

    let res = await apiCall(editURL, 'GET');
    titleControl.value = res.title;
    contentControl.value = res.content;
    userIdControl.value = res.userId;

    window.scrollTo({
        top :0,
        behavior :'smooth'
    })

    addPostBtn.classList.add('d-none');
    updatePostbtn.classList.remove('d-none');
   }
   catch(err)  {
        snackBar('Something went wrong geting Post!!', 'error')
   }
}

const onUpdatePost = async () => {
    let updateId = localStorage.getItem('editId');
    let updateObj = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value
    }
    cl(updateObj);
    postForm.reset();

    let updateURL = `${baseURL}/posts/${updateId}.json`;

    try{
        let data = await apiCall(updateURL, 'PATCH', updateObj)
    addPostBtn.classList.remove('d-none');
    updatePostbtn.classList.add('d-none');

    let card = document.getElementById(updateId);
    card.querySelector('h3').innerHTML = updateObj.title;
    card.querySelector('p').ATTRIBUTE_NODE.innerHTML = updateObj.content;

    card.scrollIntoView({
        behavior : 'smooth'
    })

    snackBar(`Post with id ${updateId} updated successfully!!`, 'success');
    }
    catch(err)  {
        snackBar('Something went wrong while updating Post!!', 'error')
   }
}

const onRemovePost = async (ele) => {
   try{
     let result = await Swal.fire({
        title: "Do you want to remove the Post?",
        showCancelButton: true,
        confirmButtonText: "Remove",
});
    if(result.isConfirmed){
        let removeId = ele.closest('.card').id;

        let removeURL = `${baseURL}/posts/${removeId}.json`;

        let res = await apiCall(removeURL, 'DELETE');
        document.getElementById(removeId).remove();

        snackBar(`Post with id ${removeId} removed successfully!!`, 'success');
    }
   }
   catch(err)  {
    snackBar('Something went wrong while removing Post!!', 'error')
   }
}

postForm.addEventListener('submit', onAddPost);
updatePostbtn.addEventListener('click', onUpdatePost);

