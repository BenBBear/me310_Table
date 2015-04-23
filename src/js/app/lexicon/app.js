angular.module('app')
    .controller('lexiconAppCtrl', function($scope, wordNet, google, spellchecker, natural) {

        function spellFilter(tokens) {
            var r = [];
            tokens.forEach(function(x) {
                try {
                    if (!spellchecker.isMisspelled(x)) {
                        r.push(x);
                    }
                } catch (e) {}
            });
            return r;
        }

        function spellEnflater(tokens) {
            var r = [];
            tokens.forEach(function(x) {
                try {
                    if (spellchecker.isMisspelled(x)) {
                        r = r.concat(spellchecker.getCorrectionsForMisspelling(x));
                    } else {
                        r.push(x);
                    }
                } catch (e) {}
            });
            var str = r.join(' '),
                new_tokens = stemmer.tokenizeAndStem(str);

            return unique(new_tokens);
        }

        $scope.lexicon_input = "";
        $scope.lexicon_result = {
            google: undefined,
            initial_tokens: undefined,
            spellchecked_Enflated_tokens: undefined,
            spellchecked_Filtered_tokens: undefined,
            wordNet: undefined
        };

        var stemmer = natural.PorterStemmer;

        $scope.$watch(function() {
            return $scope.lexicon_input;
        }, function(newVal, oldVal) {
            var tokens = $scope.lexicon_result.initial_tokens = stemmer.tokenizeAndStem(newVal).filter(function(x) {
                return x.length > 2;
            });

            var enflated_tokens = $scope.lexicon_result.spellchecked_Enflated_tokens = spellEnflater(tokens);
            var filtered_tokens = $scope.lexicon_result.spellchecked_Filtered_tokens = spellFilter(tokens);

            $scope.lexicon_result.wordNet = [];
            wordNet(enflated_tokens, function(results) {
                $scope.lexicon_result.wordNet = $scope.lexicon_result.wordNet || [];
                $scope.lexicon_result.wordNet.push(results);
            });

            google(newVal, function(err, next, links) {
                if (err) {
                    $scope.lexicon_result.google = err;
                } else {
                    $scope.lexicon_result.google = links;
                }
                $scope.$apply();
            });
        });


        $scope.lex = function(x) {
            $scope.lexicon_input = x;
        };


        $scope.debug = function() {
            debugger;
        };
    });
