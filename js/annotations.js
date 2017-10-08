/*
 * All Endpoints need to have at least the following:
 * annotationsList - current list of OA Annotations
 * dfd - Deferred Object
 * init()
 * search(options, successCallback, errorCallback)
 * create(oaAnnotation, successCallback, errorCallback)
 * update(oaAnnotation, successCallback, errorCallback)
 * deleteAnnotation(annotationID, successCallback, errorCallback) (delete is a reserved word)
 * TODO:
 * read() //not currently used
 *
 * Optional, if endpoint is not OA compliant:
 * getAnnotationInOA(endpointAnnotation)
 * getAnnotationInEndpoint(oaAnnotation)
 */

var pragma_url;
(function($){
    pragma_url = 'http://pragma.archivelab.org:8080/annotations'; //'https://pragma.archivelab.org/annotations';

    $.PragmaEndpoint = function(options) {

        jQuery.extend(this, {
            dfd:             null,
            annotationsList: [],        //OA list for Mirador use
            windowID:        null,
            eventEmitter:    null
        }, options);

        this.init();
    };

    $.PragmaEndpoint.prototype = {
        init: function() {
            //whatever initialization your endpoint needs
        },

        //Search endpoint for all annotations with a given URI in options
        search: function(options, successCallback, errorCallback) {
            var _this = this;

            console.log(options);

            //use options.uri
            jQuery.ajax({
                url: pragma_url + '?canvas_id=' +  options.uri,
                type: 'GET',
                dataType: 'json',
                headers: { },
                data: {
                    canvas_id: options.uri
                },
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    var annotations = data.annotations
		    _this.annotationsList = [];

                    jQuery.each(annotations, function(index, value) {
                        value.annotation.on = [value.annotation.on];
                        value.annotation.endpoint = _this;
			if (!value.annotation['@id']) {
			    value.annotation['@id'] = $.genUUID();
			}

			console.log(value.annotation);

			_this.annotationsList.push(value.annotation);
                    });

		    //check if a function has been passed in, otherwise, treat it as a normal search
                    if (typeof successCallback === "function") {
                        successCallback(_this.annotationsList);
                    } else {
                        _this.dfd.resolve(true);
                    }
                },
                error: function() {
                    if (typeof errorCallback === "function") {
                        errorCallback();
                    }
                }
            });
        },

        //Delete an annotation by endpoint identifier
        deleteAnnotation: function(annotationID, successCallback, errorCallback) {
            var _this = this;
            jQuery.ajax({
                url: pragma_url,
                type: 'DELETE',
                dataType: 'json',
                headers: { },
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    if (typeof successCallback === "function") {
                        successCallback();
                    }
                },
                error: function() {
                    if (typeof errorCallback === "function") {
                        errorCallback();
                    }
                }
            });
        },

        //Update an annotation given the OA version
        update: function(oaAnnotation, successCallback, errorCallback) {
	    var _this = this
            //var annotation = this.getAnnotationInEndpoint(oaAnnotation);
	    var annotation = jQuery.extend({}, oaAnnotation);
            annotation.on = oaAnnotation.on[0];
	    annotation.endpoint = undefined;
	    jQuery.ajax({
                url: pragma_url,
                type: 'POST',
                dataType: 'json',
                headers: { },
		data: JSON.stringify(annotation),
                processData: false,
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    var annotation = data.annotation;
                    annotation.endpoint = _this;
                    if (typeof successCallback === "function") {
                        successCallback(_this.getAnnotationInOA(annotation));
                    }
                },
                error: function() {
                    console.log("wreck yourself");
                    if (typeof errorCallback === "function") {
                        errorCallback();
                    }
                }
            });

        },

        //takes OA Annotation, gets Endpoint Annotation, and saves
        //if successful, MUST return the OA rendering of the annotation
        create: function(oaAnnotation, successCallback, errorCallback) {
            var _this = this;
            oaAnnotation.on = oaAnnotation.on[0];
            jQuery.ajax({
                url: pragma_url,
                type: 'POST',
                dataType: 'json',
                headers: { },
                data: JSON.stringify(oaAnnotation),
                processData: false,
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    var annotation = data.annotation;
                    annotation.endpoint = _this;
                    if (typeof successCallback === "function") {
                        successCallback(_this.getAnnotationInOA(annotation));
                    }
                },
                error: function() {
                    console.log("wreck yourself");
                    if (typeof errorCallback === "function") {
                        errorCallback();
                    }
                }
            });
        },

        userAuthorize: function(){
            return true;
        },

        set: function(prop, value, options) {
            if (options) {
                this[options.parent][prop] = value;
            } else {
                this[prop] = value;
            }
        },

        //Convert Endpoint annotation to OA
        getAnnotationInOA: function(annotation) {
            annotation.on = [annotation.on];
            return annotation;
        },

        // Converts OA Annotation to endpoint format
        getAnnotationInEndpoint: function(oaAnnotation) {
            return oaAnnotation;
        }
    };
}(Mirador));
