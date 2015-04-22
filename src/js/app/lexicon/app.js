angular.module('app')
    .controller('lexiconAppCtrl',function($scope, wordNet, google, google_images, spellchecker, tokenize){

        function spellFilter(tokens){
            var r = [];
            tokens.forEach(function(x){
                try{
                    if(!spellchecker.isMisspelled(x)){
                        r.push(x);
                    }
                }catch(e){
                }
            });
            return r;
        }
        function spellEnflater(tokens){
            var r = [];
            tokens.forEach(function(x){
                try{
                    if(spellchecker.isMisspelled(x)){
                        r.concat(spellchecker.getCorrectionsForMisspelling(x));
                    }else{
                        r.push(x);
                    }
                }catch(e){
                }
            });
            return r;
        }

        $scope.lexicon_input = "";
        $scope.lexicon_result = {};

        $scope.$watch('lexicon_input', function(newVal, oldVal){
            var tokens = $scope.lexicon_result.initial_tokens = tokenize(newVal);
            var enflated_tokens = $scope.lexicon_result.spellchecked_Enflated_tokens = spellEnflater(tokens);
            var filtered_tokens = $scope.lexicon_result.spellchecked_Filtered_tokens = spellFilter(tokens);
            wordNet(filtered_tokens, function(results){
                $scope.lexicon_result.wordNet = $scope.lexicon_result.wordNet || [];
                $scope.lexicon_result.wordNet.push(results);
            });
            google(newVal, function(err,next, links){
                if(err){
                    $scope.lexicon_result.google = err;
                }else{
                    $scope.lexicon_result.google = links;
                }
            });
        });


        $scope.lex = function(x){
            $scope.lexicon_input = x;
        };
    });
