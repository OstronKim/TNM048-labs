/**
 * @Created Jan 25, 2018
 * @LastUpdate Jan 31, 2020
 * @author Kahin Akram
 */

function kmeans(data, k) {

    //Crap we need
    var iterations = 0;
    var maxLoops = 100;
    var qualityChange = 0;
    var oldqualitycheck = 0;
    var qualitycheck = 1000000;
    var converge = false;

    //Parse the data from strings to floats
    var new_array = parseData(data);

    //Task 4.1 - Select random k centroids
    var centroid = initCentroids(new_array,k);

    //Prepare the array for different cluster indices
    var clusterIndexPerPoint = new Array(new_array.length).fill(0);

    //Task 4.2 - Assign each point to the closest mean.
    clusterIndexPerPoint = assignPointsToMeans(new_array, centroid);

    //Master loop -- Loop until quality is good
    do {
        //Task 4.3 - Compute mean of each cluster
        centroid = computeClusterMeans(new_array, clusterIndexPerPoint, k);
        // assign each point to the closest mean.
        var clusterIndexPerPoint = assignPointsToMeans(new_array, centroid);

        oldqualitycheck = qualitycheck;

        //Task 4.4 - Do a quality check for current result
        qualitycheck = qualityCheck(centroid,new_array,clusterIndexPerPoint);

        qualityChange = oldqualitycheck - qualitycheck;
        console.log(qualityChange);
        iterations++;

        if(qualityChange < 0.001 || iterations == maxLoops) 
            converge = true;
        
    }
    while (converge == false)
    console.log("Iterations: " + iterations)


    //Return results
    return {
        assignments: clusterIndexPerPoint
    };

}

/**
 * Parse data from strings to floats
 * Loop over data length
      loop over every i in data
        Fill array with parsed values, use parseFloat
 * @param {*} data
 * @return {array}
 */
function parseData(data){ //Suited for data 1,2 (Add D,E)

var array = [];

for(var i = 0; i < data.length; i++){ 
    var temp = data[i];
    
    array[i] = [
        parseFloat(temp.A),
        parseFloat(temp.B),
        parseFloat(temp.C),
        parseFloat(temp.D),
        parseFloat(temp.E)
    ];
}
    return array;
}

/**
 * Task 4.1 - Randomly place K points
 * Loop over data and Use floor and random in Math
 * @return {array} centroid
 */

function initCentroids(data, k){
    //console.log("Data length = "+ data.length);

    //Create k centroids
    var centroids = [];
    for(var i = 0; i < k; i++){
        var randCent = Math.floor(Math.random() * data.length); //Choose a random point between 0 and max length of data
        centroids[i] = data[randCent];  
       // console.log("Random number: " +randCent);   
    }
   // console.log("Random points: " +centroids);

    return centroids;
}

/**
* Taks 4.2 - Assign each item to the cluster that has the closest centroid
* Loop over points and fill array, use findClosestMeanIndex(points[i],means)
* Return an array of closest mean index for each point.
* @param points
* @param means
* @return {Array}
*/
function assignPointsToMeans(points, means){ //points=data, means=centroids
    var assignments = [];
    
    for(var i = 0; i < points.length; i++){
        assignments[i] = findClosestMeanIndex(points[i],means);
    }
   // console.log("Assignments: "+ assignments );
    return assignments;
};
/**
 * Calculate the distance to each mean, then return the index of the closest.
 * Loop over menas and fill distance array, use euclideanDistance(point,means[i])
 * return closest cluster use findIndexOfMinimum,
 * @param point
 * @param means
 * @return {Number}
*/
function findClosestMeanIndex(point, means){
    var distances = [];
    for(var i = 0; i < means.length; i++){
        distances[i] = euclideanDistance(point,means[i]);
    }

    return findIndexOfMinimum(distances);
};
/**
 * Euclidean distance between two points in arbitrary dimension(column/axis)
 * @param {*} point1
 * @param {*} point2
 * @return {Number}
 */

function euclideanDistance(point1, point2){ //Add for D,E later

    if (point1.length != point2.length)
        throw ("point1 and point2 must be of same dimension");
    
    //var sum = (Math.sqrt( Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2)));
    var sum = (Math.sqrt( Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + 
    Math.pow(point1[2] - point2[2], 2) +  Math.pow(point1[3] - point2[3], 2) +  Math.pow(point1[4] - point2[4], 2)));
   
    return sum; 

};

/**
 * Return the index of the smallest value in the array.
 *  Loop over the array and find index of minimum
 * @param array
 * @return {Number}
 */
function findIndexOfMinimum(array){

    var index = 0;
    var temp = 10000;
    for(var i = 0; i < array.length; i++){
       if(temp > array[i])  {
           temp = array[i];
           index = i;
           
       }
    }
    return index;
};

/**
 * //Task 4.3 - Compute mean of each cluster
 * For each cluster loop over assignment and check if ass. equal to cluster index
 * if true fill array
 * then if array is not empty fill newMeans, use averagePosition(array)
 * @param {*} points
 * @param {*} assignments
 * @param {*} k
 * @returns {array}
 */
function computeClusterMeans(points, assignments, k){

    if (points.length != assignments.length)
        throw ("points and assignments arrays must be of same dimension");

    // for each cluster
    var newMeans = [];

    for(var i = 0; i < k; i++){         //Loop through each cluster
        var temp = [];
        for(var n = 0; n < assignments.length; n++){ //Loop thrugh the assignment array and check if the point belongs to the cluster we are on
            if(assignments[n] == i){
                temp.push(points[n]); //Store those values in a temporary array
            }
        }
        newMeans[i] = averagePosition(temp); //Assigns the medium value in the array as the new centroid
    }
    // console.log("New centroid1:" + newMeans[0]);
    // console.log("New centroid2:" + newMeans[1]);
    // console.log("New centroid3:" + newMeans[2]);
    // console.log("New centroid4:" + newMeans[3]);
    return newMeans;
};

/**
 * Calculate quality of the results
 * For each centroid loop new_array and check if clusterIndexPerPoint equal clsuter
 * if true loop over centriod and calculate qualitycheck.
 * @param {*} centroid
 * @param {*} new_array
 * @param {*} clusterIndexPerPoint
 */
function qualityCheck(centroid, new_array, clusterIndexPerPoint){ //ClusterInderPerPoint = assignments, new_array = data
    var qualitycheck = 0;

    for(var i = 0; i < centroid.length; i++){   //loop through each centroid
        for(var n = 0; n < new_array.length; n++){      //loop throgh the data points
            if(clusterIndexPerPoint[n] == i){           //for all the data points belonging to that cluster 
                qualitycheck += Math.pow(euclideanDistance(centroid[i],new_array[n]),2);     //Sum the total squared distance for that cluster
            }

        }
    }
  //  console.log("Qaulity = " + qualityCheck);
    return qualitycheck;
}

/**
 * Calculate average of points
 * @param {*} points
 * @return {number}
 */
function averagePosition(points){

    var sums = points[0];
    for (var i = 1; i < points.length; i++){
        var point = points[i];
        for (var j = 0; j < point.length; j++){
            sums[j] += point[j];
        }
    }

    for (var k = 0; k < sums.length; k++)
        sums[k] /= points.length;

    return sums;
};
