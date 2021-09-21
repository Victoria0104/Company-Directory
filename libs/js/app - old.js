// Global Variables
let users = [];
let testvar = 0;

var currentLocations = [];
var currentDepartments = [];

let firstName_toggle = true;
let lastName_toggle = true;
let email_toggle = true;
let jobTitle_toggle = true;
let department_toggle = true;
let location_toggle = true;


// User Object Definition
function User(id, firstName, lastName, email, jobTitle, location, department){
    
    this.id = id,
    this.icon = "fas fa-user-circle",
    this.firstName = firstName,
    this.lastName = lastName
    this.email = email,
    this.jobTitle = jobTitle,
    this.location = location,
    this.department = department
};

// Main AJAX & jQuery Code
$(document).ready(() => {

    function getAllUsers(){
        // Generate all user data for the table        
        $.ajax({
            type: 'GET',
            url: "../companydirectory/libs/php/getAll.php",
            data: {},
            dataType: 'json',
            async: false,
            success: function(results) {

                users = [];
                const data = results["data"]

                for(let i=0; i < data.length; i++){
                    username = "user" + data[i].id

                    if(window[username]){
                        window[username].id = data[i].id, 
                        window[username].firstName = data[i].firstName, 
                        window[username].lastName = data[i].lastName, 
                        window[username].email = data[i].email, 
                        window[username].jobTitle = data[i].jobTitle, 
                        window[username].location = data[i].location, 
                        window[username].department = data[i].department
                    } else {
                        window[username] = new User(
                            data[i].id, 
                            data[i].firstName, 
                            data[i].lastName, 
                            data[i].email, 
                            data[i].jobTitle, 
                            data[i].location, 
                            data[i].department
                        )
                    }
                    users.push(window[username]);
                }

                // Sort Table user List by ID as default 
                users.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));

                updateTable();

            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })
    }

    getAllUsers();

    // --------------------------------------------------------- Users ---------------------------------------------------------
    // User Modal Behaviour
    $('.tableRow').click(function() {

        $("#userSelectModal").modal('show'); 
        
        var current_user;

        for(i=0;i<users.length;i++){
            if(users[i].id == this.id){
                current_user = users[i];
            }
        };

        console.log("current user: ", current_user);
        
        $('#userSelectModalLabel').html(`${current_user.firstName} ${current_user.lastName}`);
        $('#user_id').val(current_user.id);
        $('#user_firstName').val(current_user.firstName);
        $('#user_lastName').val(current_user.lastName);
        $('#user_email').val(current_user.email);
        $('#user_jobTitle').val(current_user.jobTitle);
        $('#user_department').val(current_user.department);
        $('#user_location').val(current_user.location);

        $("#edit").click(function(){      

            $("#userEditModal").modal('show'); 
            $('.modal-backdrop').show(); // Show the grey overlay.

            $('#edit_user_firstName').val(`${current_user.firstName}`);
            $('#edit_user_lastName').val(`${current_user.lastName}`);
            $('#edit_user_email').val(`${current_user.email}`);
            $('#edit_user_jobTitle').val(`${current_user.jobTitle}`);
            $('#edit_user_department').html(current_user.department);
            $('#edit_user_location').html(current_user.location);

            getDepartmentsByUser();
            let departmentSelection = "";
            for(i=0; i<currentDepartments.length; i++){
                if(currentDepartments[i].department == current_user.department){
                    departmentSelection += `<option value="${currentDepartments[i].id}" selected="selected">${currentDepartments[i].department}</option>`
                } else {
                    departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
                }                
            }

            $('#edit_user_department').html(departmentSelection);

            $("#edit_user_department").change(function(){
                
                let locationSelectionHTML = "";
                let locationID = document.getElementById('edit_user_department').value;
                
                for(let i=0; i < currentDepartments.length; i++){
                    if (currentDepartments[i]['id'] == locationID){
                        locationSelectionHTML = `${currentDepartments[i]['location']}`
                    }
                }
                
                $('#edit_user_location').html(locationSelectionHTML);
            })
        
            $("#editUserConfirm").click(function(){      
                $("#editUserConfirm").attr("userID", current_user.id);
            })
        });

        // Delete User
        $("#delete").click(function(){      
            
            $("#userDeleteModal").modal('show');      
            $('#deleteConfirm').html(`${current_user.firstName} ${current_user.lastName} <br>`);
            
            $(`#delUserConfirm`).on('click', event => {
                var userID = current_user.id;
               
                $.ajax({
                    type: 'POST',
                    url: "./libs/php/deleteUserByID.php",
                    data: {
                        id: userID,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                }) 

               getAllUsers();
            })
        });
    })

    // Confirm Edit User -> PHP Routine
    $("#editUserForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/updateUser.php",
            data: {
                firstName: $('#edit_user_firstName').val(),
                lastName: $('#edit_user_lastName').val(),
                email: $('#edit_user_email').val(),
                jobTitle: $('#edit_user_jobTitle').val(),
                departmentID: $('#edit_user_department').val(),
                id: $("#editUserConfirm").attr("userID")
            },
            dataType: 'json',
            async: false,
            success: function(results) {
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        }) 
        
        getAllUsers();

        $("#userEditModal").modal('hide');
        $('.modal-backdrop').hide(); // removes the grey overlay.
        
    });


    // Add User Modal
    $(`#addUser`).on('click', event => {
        
        $('.modal-backdrop').show(); // Show the grey overlay.

        getDepartmentsByUser();
        let departmentSelection = ``;

        for(i=0; i<currentDepartments.length; i++){
            departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
        }

        $('#add_user_department').html(departmentSelection);

        function updateLocation(){
            let locationSelectionHTML = "";
            let locationID = document.getElementById('add_user_department').value;
            
            for(let i=0; i < currentDepartments.length; i++){
                if (currentDepartments[i]['id'] == locationID){
                    locationSelectionHTML = `${currentDepartments[i]['location']}`
                }
            }
            
            $('#add_user_location').html(locationSelectionHTML);
        }

        updateLocation();

        $("#add_user_department").change(function(){
            updateLocation();
        })

    });

    // Confirm Add User -> PHP Routine
    $("#newUserForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertUser.php",
            data: {
                firstName: $('#add_user_firstName').val(),
                lastName: $('#add_user_lastName').val(),
                email: $('#add_user_email').val(),
                jobTitle: $('#add_user_jobTitle').val(),
                departmentID: $('#add_user_department').val()
            },
            dataType: 'json',
            async: false,
            success: function(results) {
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

        
        $('#add_user_firstName').val("");
        $('#add_user_lastName').val("");
        $('#add_user_email').val("");
        $('#add_user_jobTitle').val("");

        getAllUsers();

        $("#addUserModal").modal('hide');
        $('.modal-backdrop').hide(); // removes the grey overlay.
    });


    // --------------------------------------------------------- Departments ---------------------------------------------------------

    // Department Modal Behaviour
    $(`#departments`).on('click', event => {

        generateDepartmentList();

        $("#addDepartment").click(function(){      
            
            document.getElementById('newDepName').value = "";
            getLocations();
            
            console.log(currentLocations)

            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
            }

            $('#newDepLocation').html(locationSelection);

        });

        // Edit Department
        $('.depTableRow').click(function(){      
            
            $('.modal-backdrop').show(); // Show the grey overlay.

            $('#editDepName').val(`${this.title}`);
            $('#editDepForm').attr("depID", `${this.attributes.departmentID.value}`);
            
            var depID = this.id;
            var locID = this.attributes.location.value;
            
            if (this.attributes.users.value == 0){
                $("#deleteDepBtn").show();
                $("#departmentDelete").attr("departmentName",this.attributes.title.value);
                $("#departmentDelete").attr("departmentID",this.attributes.departmentID.value);
            } else {
                $("#deleteDepBtn").hide();
            }

            getLocations();
            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                
                if(currentLocations[i].id == locID){
                    locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`
                }
                else {
                    locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
                }
            }

            $('#editDepLocation').html(locationSelection);

        });

        // Confirm Edit Department -> PHP Routine
        $("#editDepForm").submit(function(e) {

            e.preventDefault();
            e.stopPropagation();

            $.ajax({
                type: 'POST',
                url: "../companydirectory/libs/php/updateDepartment.php",
                data: {
                    name: $('#editDepName').val(),
                    locationID: $('#editDepLocation').val(),
                    departmentID: this.attributes.depID.value
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            }) 
    
            getAllUsers();
            $("#departmentEditModal").modal('hide');
            $('.modal-backdrop').hide(); // removes the grey overlay.
        })

        // Delete Department
        $("#departmentDelete").click(function(){      
    
            $('.modal-backdrop').show(); // Show the grey overlay.
            $('#delDepName').html(`${this['attributes']['departmentName']['value']}`);

            var depID = this.attributes.departmentID.value;
            
            $("#delDepConfirm").click(function(){ 
                var depIDInt = parseInt(depID)
                
                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteDepartmentByID.php",
                    data: {
                        id: depIDInt,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                })
                
                getAllUsers();
                $('.modal-backdrop').hide(); // removes the grey overlay.

            })
        });

    })    

    // Add Department -> PHP Routine
    $("#addDepForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertDepartment.php",
            data: {
                name: $('#newDepName').val(),
                locationID: $('#newDepLocation').val()
            },
            dataType: 'json',
            async: false,
            success: function(results) {
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

        getAllUsers();
        $("#addDepartmentModal").modal('hide');
        $('.modal-backdrop').hide(); // removes the grey overlay.

    })


    // --------------------------------------------------------- Locations ---------------------------------------------------------

    // Location Modal Behaviour
    $(`#locations`).on('click', event => {

        // Generate the html table with locations list 
        $.ajax({
            type: 'GET',
            url: "../companydirectory/libs/php/getLocations.php",
            data: {},
            dataType: 'json',
            async: false,
            success: function(results) {
                let data = results["data"];
                let locArray = [];
                let loc_html = ``;

                for(let i=0; i < data.length; i++){
                    locArray.push(data[i]);
                }

                for(let i=0; i < locArray.length; i++){
                    loc_html += `<tr id="${locArray[i].id}" class=" locationEdit locTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#locationEditModal" locationName="${locArray[i].location}" locationID="${locArray[i].id}" departments="${locArray[i].departments}"><td scope="row" class="locationHeader">${locArray[i].location}</td></tr>`;
                }

                $('#locationsList').html(loc_html);
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })   


        // Edit Location Modal
        $(".locationEdit").click(function(){      
            
            $('.modal-backdrop').show();

            $('#edit_location_name').val(this.attributes.locationName.value);
            $('#edit_location_name').attr("locID", this.attributes.locationID.value);
        
            if (this.attributes.departments.value == 0){
                $("#deleteLocBtn").show();
                $("#locationDelete").attr("locationName",this.attributes.locationName.value);
                $("#locationDelete").attr("locationID",this.attributes.locationID.value);
            } else {
                $("#deleteLocBtn").hide();
            }
        
        });

        // Delete Location -> PHP Routine
        $("#locationDelete").click(function(){
            
            $('#delLocName').html(`${this['attributes']['locationName']['value']}`);

            var locID = this.attributes.locationID.value;
            
            $("#delLocForm").submit(function(e) {

                e.preventDefault();
                e.stopPropagation();

                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteLocationByID.php",
                    data: {
                        locationID: locID,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                }) 
            })
        });
    });    

    // Edit Location -> PHP Routine
    $("#editLocForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();
        
        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/updateLocation.php",
            data: {
                name: $('#edit_location_name').val(),
                locationID: $('#edit_location_name').attr("locID"),
            },
            dataType: 'json',
            async: false,
            success: function(results) {
            },
    
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        }) 

        getAllUsers();
        $("#locationEditModal").modal('hide');
        $('.modal-backdrop').hide(); // removes the grey overlay.
        
    })

    // Add Location - Modal
    $("#addLocation").click(function(){
        $('.modal-backdrop').show();
        $('#newLocName').val("");
    })

    // Add Location -> PHP Routine
    $("#addLocForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertLocation.php",
            data: {
                name: $('#newLocName').val(),
            },
            dataType: 'json',
            async: false,
            success: function(results) {
            },
    
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

        getAllUsers();
        $("#addLocationModal").modal('hide');
        $('.modal-backdrop').hide(); // removes the grey overlay.

    })


    // --------------------------------------------------------- Search Functions ---------------------------------------------------------

    // Search Functionality
    $("#search").click(function(){
        
        document.getElementById("resetBtn").style.visibility = 'visible';
        var option = document.getElementById("searchSelect").value;
        
        if(option == 'firstName'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_firstName.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'lastName'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_lastName.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'email'){
                $.ajax({
                    type: 'GET',
                    url: "../companydirectory/libs/php/search_email.php",
                    data: {
                        search: "%" + document.getElementById("searchField").value + "%"
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        generateSearchResultsUsers(results);
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                })
        } else if (option == 'jobTitle'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_jobTitle.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'department'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_department.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'location'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_location.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        }
    })

    $("#resetBtn").on('click', () => {
        document.getElementById("resetBtn").style.visibility = 'hidden';
        document.getElementById("searchField").value = "";
        updateTable();
        
        var colHeaders = document.getElementsByClassName('sort');
        for (var i=0; i<colHeaders.length; i++) {
            colHeaders[i].style.cursor = "pointer";
        }

        var sorters = document.getElementsByClassName('sortBtn');
        for (var i=0; i<sorters.length; i++) {
            sorters[i].style.visibility = 'visible';
        }
    }) 

    // ------------------------------- Sorting Button Functionality --------------------------------------
    // Cannot seem to get this to work in one function? Instead only way it seems to work is in individual onclicks?

    // First Name Sort Button
    $('#firstName').on('click', () => {
        if (firstName_toggle == false){
            function compare( a, b ) {
                if ( a.firstName > b.firstName ){
                return -1;
                }
                if ( a.firstName < b.firstName ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            firstName_toggle = true; 
        } else {
            function compare( a, b ) {
                if ( a.firstName < b.firstName ){
                return -1;
                }
                if ( a.firstName > b.firstName ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            firstName_toggle = false;
        }
        updateTable();    
    });

    // Last Name Sort Button
    $('#lastName').on('click', () => {
        if (lastName_toggle == false){
            function compare( a, b ) {
                if ( a.lastName > b.lastName ){
                return -1;
                }
                if ( a.lastName < b.lastName ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            lastName_toggle = true; 
        } else {
            function compare( a, b ) {
                if ( a.lastName < b.lastName ){
                return -1;
                }
                if ( a.lastName > b.lastName ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            lastName_toggle = false;
        }
        updateTable();    
    });

    // Email Sort Button
    $('#email').on('click', () => {
        if (email_toggle == false){
            function compare( a, b ) {
                if ( a.email > b.email ){
                return -1;
                }
                if ( a.email < b.email ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            email_toggle = true; 
        } else {
            function compare( a, b ) {
                if ( a.email < b.email ){
                return -1;
                }
                if ( a.email > b.email ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            email_toggle = false;
        }
        updateTable();    
    });

    // Job Title Sort Button
    $('#jobTitle').on('click', () => {
        if (jobTitle_toggle == false){
            function compare( a, b ) {
                if ( a.jobTitle > b.jobTitle ){
                return -1;
                }
                if ( a.jobTitle < b.jobTitle ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            jobTitle_toggle = true; 
        } else {
            function compare( a, b ) {
                if ( a.jobTitle < b.jobTitle ){
                return -1;
                }
                if ( a.jobTitle > b.jobTitle ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            jobTitle_toggle = false;
        }
        updateTable();    
    });

    // Department Sort Button
    $('#department').on('click', () => {
        if (department_toggle == false){
            function compare( a, b ) {
                if ( a.department > b.department ){
                return -1;
                }
                if ( a.department < b.department ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            department_toggle = true; 
        } else {
            function compare( a, b ) {
                if ( a.department < b.department ){
                return -1;
                }
                if ( a.department > b.department ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            department_toggle = false;
        }
        updateTable();    
    });

    // Location Sort Button
    $('#location').on('click', () => {
        if (location_toggle == false){
            function compare( a, b ) {
                if ( a.location > b.location ){
                return -1;
                }
                if ( a.location < b.location ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            location_toggle = true; 
        } else {
            function compare( a, b ) {
                if ( a.location < b.location ){
                return -1;
                }
                if ( a.location > b.location ){
                return 1;
                }
                return 0;
            }
            users.sort( compare );
            location_toggle = false;
        }
        updateTable();    
    }); 

});

function updateTable(){

    // Update Main HTML Table    
    $('#mainTable').html(""); 
    var html_table = "";
    
    for(i=0; i < users.length; i++){
        html_table += `<tr class="tableRow" id="${users[i].id}"><td scope="row" class="tableIcon"><i class="fas ${users[i].icon} fa-lg"></i></td><td scope="row">${users[i].firstName}</td><td scope="row">${users[i].lastName}</td><td scope="row">${users[i].email}</td><td scope="row">${users[i].jobTitle}</td><td scope="row">${users[i].department}</td><td scope="row">${users[i].location}</td></tr>`;
    }
    
    $('#mainTable').html(html_table); 
    
};

function generateSearchResultsUsers(results){
    let searchData = results["data"];
    let searchList = [];
    let list = searchData['personnel'];

    for(let i=0; i < list.length; i++){
        searchList.push(list[i]['id']);
    }

    generateSearchResultsTable(searchList);
}

function generateSearchResultsTable(userList){
    
    var search_html_table = "";

    // Update Main HTML Table
    for(i=0; i < userList.length; i++){
        
        returnedUser = "user" + userList[i];

        search_html_table += `<tr class="tableRow" id="${window[returnedUser].id}" data-bs-toggle="modal" data-bs-target="#userSelectModal"><td scope="row"><i class="fas ${window[returnedUser].icon} fa-lg"></i></td><td scope="row">${window[returnedUser].firstName}</td><td scope="row">${window[returnedUser].lastName}</td><td scope="row">${window[returnedUser].email}</td><td scope="row">${window[returnedUser].jobTitle}</td><td scope="row">${window[returnedUser].department}</td><td scope="row">${window[returnedUser].location}</td></tr>`;
    }
    
    $('#mainTable').html(search_html_table);

    // Hide sort buttons 
    var colHeaders = document.getElementsByClassName('sort');
    for (var i=0; i<colHeaders.length; i++) {
        colHeaders[i].style.cursor = "auto";
    }

    var sorters = document.getElementsByClassName('sortBtn');
    for (var i=0; i<sorters.length; i++) {
        sorters[i].style.visibility = 'hidden';
    }
}

function getLocations(){
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getLocations.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            currentLocations = [];
            let data = results["data"];

            for(let i=0; i < data.length; i++){
                currentLocations.push(data[i]);
            }

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })   
}

function getDepartmentsByUser(){
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getDepartmentsByUser.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            currentDepartments = [];
            let data = results["data"];

            for(let i=0; i < data.length; i++){
                currentDepartments.push(data[i]);
            }

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })   
}

function generateDepartmentList(){
    // Generate the html table with department list 
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getDepartmentsByUser.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            let data = results["data"];
            let depArray = [];
            let dep_html = ``;

            for(let i=0; i < data.length; i++){
                depArray.push(data[i]);
            }

            for(let i=0; i < depArray.length; i++){
                dep_html += `<tr id="${depArray[i].id}" class=" departmentEdit depTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#departmentEditModal" title="${depArray[i].department}" location="${depArray[i].locationID}" users="${depArray[i].users}" departmentID="${depArray[i].id}"><td class="tableIcon"><i class="fas fa-building"></i></td><td scope="row" class="department"> ${depArray[i].department} </td><td scope="row" class="department_location"> ${depArray[i].location} </td>`;
            }

            $('#departmentsList').html(dep_html);

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })     
}