"use strict";

const generalAnimations = function(){
    $('.animated-list li').mouseenter(function () {
        $(this).addClass('hovered');
    });

    $('.animated-list li').mouseleave(function () {
        $(this).removeClass('hovered');
    });

    $('.messages').click(function () {
        $(this).empty();
    });

};

const changeSite = function(url, title, cb){
    $('#root').load(url, function () {
        cb ? cb() : '';
        generalAnimations();
    });
    document.title = title;
};

const setCookie = function (name, value){
    document.cookie = name + '=' + value + ';path=/manufacturer';
};

const handleFilterChange = function (){
    $('#filter-cars #cars-manufacturer').change(function () {
        const manufacturer = $(this).val();

        if(manufacturer === 'All'){

            $('.cars tbody')
                .empty();

            getCars();

            return;
        }

        setCookie('name', manufacturer);

        $.get('/manufacturer')
            .done(function (manufacturerCars) {

                $('.cars tbody')
                    .empty();

                manufacturerCars.forEach(function (manufacturerCar) {

                    $('.cars tbody')
                        .append(`
                            <tr>
                                <td>${manufacturerCar.name}</td>
                                <td>${manufacturerCar.consumption}</td>
                                <td>${manufacturerCar.color}</td>
                                <td>${manufacturerCar.manufacturer}</td>
                                <td>${manufacturerCar.available}</td>
                                <td>${manufacturerCar.year}</td>
                                <td>${manufacturerCar.horsepower}</td>
                            </tr>
                        `);

                });

            })
            .fail(function (res) {
                console.log(res);
            });
    });
};

const getCars = function () {

    $.get('/cars')
        .done(function(cars) {

            cars.forEach(function (car) {

                $('.cars tbody').append(`
                        <tr>
                            <td>${car.name}</td>
                            <td>${car.consumption}</td>
                            <td>${car.color}</td>
                            <td>${car.manufacturer}</td>
                            <td>${car.available}</td>
                            <td>${car.year}</td>
                            <td>${car.horsepower}</td>
                        </tr>
                    `);

            });

        })
        .fail(function() {
            alert( "error" );
        });
};

const getManufacturerNames = function(cb){
    
    $.get('/manufacturerNames')
        .done(function (manufacturerNames) {
            cb(manufacturerNames);
        })
        .fail(function (error) {
            console.log(error);
        });

};

const getManufacturers = function () {
    $.get('/manufacturers')
        .done(function(manufacturers) {

                manufacturers.forEach(function (manufacturer) {

                    $('.manufacturers tbody').append(`
                        <tr>
                            <td>${manufacturer.name}</td>
                            <td>${manufacturer.country}</td>
                            <td>${manufacturer.founded}</td>
                        </tr>
                    `);

                });

        })
        .fail(function() {
            alert( "error" );
        });
};

const validate = function(fields){
    let errors = [];

    fields.forEach(function (field) {

        if(field.required === true){
            if(!field.value){
                errors.push(`${field.name} field can not be empty`);
            }
        }

        if(field.isNumber === true){
            let regExp = RegExp('^\\d+$');

            if(!(regExp.test(field.value))){
                errors.push(`${field.name} field must be a number`);
            }
        }

        if(field.valueIsIn){
            if(!(field.valueIsIn.includes(field.value))){
                errors.push(`${field.name} field must be on of the specified options`);
            }
        }

        if(field.min || field.min == 0){
            if(field.value < field.min){
                errors.push(`${field.name} field must be greater than ${field.min}`);
            }
        }

        if(field.max || field.max == 0){
            if(field.value > field.max){
                errors.push(`${field.name} field can not be bigger than ${field.max}`);
            }
        }

    });

    return errors;
};

const resetMessageBox = function(messageBox, from, to){
    messageBox
        .removeClass(from)
        .addClass(to)
        .empty()
    ;

    return messageBox;
};

const handleAddCarForm = function () {

    getManufacturerNames(function (manufacturerNames) {

        manufacturerNames.forEach(function (manufacturerName){
            $('#manufacturer').append(`<option value="${manufacturerName}">${manufacturerName}</option>`);
        });

        $('#add-car').submit(function (e) {
            e.preventDefault();

            const name = $('#add-car #name').val();
            const consumption = $('#add-car #consumption').val();
            const color = $('#add-car #color').val();
            const manufacturer = $('#add-car #manufacturer').val();
            const available = $('#add-car #available').val();
            const year = $('#add-car #year').val();
            const horsepower = $('#add-car #horsepower').val();

            let errors = validate([
                {value: name, name: 'Name', required: true},
                {value: consumption, name: 'Consumption', required: true, isNumber: true, min: 1, max: 100000},
                {value: color, name: 'Color', required: true},
                {value: manufacturer, name: 'Manufacturer', required: true, valueIsIn: manufacturerNames},
                {value: available, name: 'Available', required: true, isNumber: true, min: 0},
                {value: year, name: 'Year', required: true, isNumber: true, min: 1900, max: new Date().getFullYear()},
                {value: horsepower, name: 'Horsepower', required: true, isNumber: true, min: 0}
            ]);

            if(errors.length <= 0){

                const data = {
                    name: name,
                    consumption: consumption + "l/100km",
                    color: color,
                    manufacturer: manufacturer,
                    available: available,
                    year: year,
                    horsepower: horsepower,
                };

                $.post('/addCar', data)
                    .done(function () {

                        resetMessageBox($('.messages'), 'error', 'success')
                            .append(`<div>Car added successfully</div>`)
                        ;

                    })
                    .fail(function (res) {

                        if(res.status === 409){
                            resetMessageBox($('.messages'), 'success', 'error')
                                .append(`<div>Car already exists in the database</div>`)
                            ;
                        }else{
                            resetMessageBox($('.messages'), 'success', 'error')
                                .append(`<div>Database error, please contact the site administrator</div>`)
                            ;
                            console.log(res);
                        }

                    });

            }else{

                let messageBox = resetMessageBox($('.messages'), 'success', 'error');

                errors.forEach(function (error) {
                    messageBox.append(`<div>${error}</div>`)
                });

            }

        });

    });

};

const handleManufacturerForm = function(){
    $('#add-manufacturer').submit(function (e) {
        e.preventDefault();

        const name = $('#add-manufacturer #name').val();
        const country = $('#add-manufacturer #country').val();
        const foundedPlain = $('#add-manufacturer #founded').val();

        let errors = validate([
            {value: name, name: 'Name', required: true},
            {value: country, name: 'Country', required: true},
            {value: foundedPlain, name: 'Founded', required: true}
        ]);

        if(errors.length <= 0){
            const founded = new Date(foundedPlain);
            const foundedMonth = founded.toLocaleString('en-GB', { month: 'long'});
            const foundedDay = founded.toLocaleString('en-GB', { day: '2-digit'});
            const foundedYear = founded.toLocaleString('en-GB', { year: 'numeric'});

            const data = {
                name: name,
                country: country,
                founded: `${foundedMonth} ${foundedDay}, ${foundedYear}`
            };

            $.post('/addManufacturers', data)
                .done(function () {

                    resetMessageBox($('.messages'), 'error', 'success')
                        .append(`<div>Manufacturer added successfully</div>`)
                    ;

                })
                .fail(function (res) {

                    if(res.status === 409){
                        resetMessageBox($('.messages'), 'success', 'error')
                            .append(`<div>Manufacturer already exists in the database</div>`)
                        ;
                    }else{
                        resetMessageBox($('.messages'), 'success', 'error')
                            .append(`<div>Database error, please contact the site administrator</div>`)
                        ;
                        console.log(res);
                    }

                });

        }else{

            let messageBox = resetMessageBox($('.messages'), 'success', 'error');

            errors.forEach(function (error) {
                messageBox.append(`<div>${error}</div>`)
            });

        }

    })
};

//here path is the URL's hash part
const switchSite = function(path){
    switch (path){
        case '':
            changeSite("./pages/home.html", "Home");
            break;
        case '#manufacturers':
            changeSite("./pages/manufacturers.html", "Manufacturers", getManufacturers);
            break;
        case '#cars':
            changeSite("./pages/cars.html", "Cars", function(){

                getManufacturerNames(function (manufacturerNames) {

                    manufacturerNames.forEach(function (manufacturerName){
                        $('#cars-manufacturer').append(`<option value="${manufacturerName}">${manufacturerName}</option>`);
                    });

                });

                getCars();

                handleFilterChange();
            });
            break;
        case '#add-manufacturer':
            changeSite("./pages/add-manufacturer.html", "Add manufacturer", handleManufacturerForm);
            break;
        case '#add-car':
            changeSite("./pages/add-car.html", "Add car", handleAddCarForm);
            break;
        default:
            changeSite("./pages/home.html", "Home");

    }
};


$(document).ready(function () {

    switchSite(window.location.hash);

    $(window).on("hashchange", function() {
        switchSite(window.location.hash);
    });

});