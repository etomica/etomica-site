
## Note: 

Only in these simulations, molecular weight (M) and degree of polymerization (X) are equivalent, since the monomers have a molecular weight of one.  Mn and Xn note number average quantities, while Mw and Xw note weight-average quantities.  PDI notes the polydispersity index.

## Temperature effects in Stepwise Growth 



Setup an experiment with the following conditions in the Stepwise Growth module:


* Set Temperature: Isothermal, 300K
* Number of Molecules = 250 di-ol, 250 di-acid, other species = 0
* Reaction Energy = 30 kJ/mol
* 1 for heat transfer to solvent
* Simulation delay can be set to your preference


You may start the simulation and watch the reaction in the configuration tab.
Note that the metrics, temperature, composition, MW, and conversion tabs calculate the corresponding values in real time.


Pause the simulation and click on the MW tab.  Reinitialize and start the experiment.  Let the experiment run for about 10 units of time and pause the simulation.  Right click on the graph to access the raw data and copy the data for Mw to Excel (or other plotting program).


After the data has been recorded change:
* Set Temperature: Adiabatic, 300K
* Reaction Energy = 30 kJ/mol
* 0 for heat transfer to solvent


Reinitialize and start the experiment again.  Let the experiment run for about 10 units of time and pause the simulation.  Right click on the graph to access the raw data and copy the data for Mw to Excel (or other plotting program). 


1. Plot Mw vs. time on the same graph for the adiabatic and isothermal experiments.
1. How do they differ?  Which achieves the highest Mw?
1. Would you expect this to happen in theory?  (Why?)
1. Would this happen in an actual experiment?  If not, how would it differ?
1. Briefly discuss the advantages and disadvantages of running an industrial polymerization under isothermal vs. adiabatic conditions.


 
## Stoichiometric effects 

Setup an experiment with the following conditions in the Stepwise Growth module:


*  Set Temperature: Isothermal, 300K
*  Number of Molecules = 500 di-ol, 500 di-acid, other species = 0
*  Reaction Energy = 40 kJ/mol,
*  1 for heat transfer to solvent
*  Simulation delay can be set to your preference.

You may start the simulation and watch the reaction in the configuration tab.
After some time, click on the “Metrics” tab.
1. What does the current Number Avg MW, Weight Avg MW, and PDI approach?
1. What would you expect these numbers to be in theory at 100% conversion?
1. What would you expect these numbers to be in theory at 95% conversion?
1. Pause the simulation at approximately 95% conversion.  Do the results concur with the theory?  Why/why not?



Change the following settings:
*  Number of Molecules = 500 di-ol
*  500 di-acid
*  mono-ol=50
*  other species = 0
Reinitialize the system and after some time, click on the “Metrics” tab.
1. What does the current Number Avg Molecular weight approach?
1. What would you expect this number to be in theory?
1. Is this the result expected by theory?  Why/why not?


Change the following settings:
*  Number of Molecules = 550 di-ol
*  500 di-acid, mono-ol=0
*  other species = 0
Reinitialize the system and after some time, click on the “Metrics” tab.
1. What does the current Number Avg Molecular weight approach?
1. What would you expect this number to be in theory?
1. Is this the result expected by theory?  Why/why not?



 
## Gelation 


Setup an experiment with the following conditions in the Stepwise Growth module:

Set Temperature: Isothermal, 500K
Number of Molecules = 800 di-ol, 500 di-acid, crosslinker= 200, other species = 0
Reaction Energy = 40 kJ/mol, 1 for heat transfer to solvent
Simulation delay can be set to your preference.

You may start the simulation and watch the reaction in the configuration tab.
1. Would you expect gelation to occur? If so, at what conversion?
1. Restart the simulation and pause at the conversion calculated in part 1. Submit a screenshot of your configuration window. Has gelation occurred?  If so, highlight (or ink over) the gelled molecule. (Hint: if you click in the configuration window, then press “1” you can see the neighboring cells.  You can then press “0” to return to the previous viewport)
1. Restart the simulation and let it run until gelation occurs.  Submit a screenshot of your configuration window. Does gelation occur eventually?  If so, highlight (or ink over) the gelled molecule.  At what conversion did it (or did it not) occur?
1. Do your results from 2 and 3 agree with the theoretical calculation in part 1?



## Stepwise Growth vs. Chain Addition Polymerization 

Setup a Stepwise Growth experiment with the following conditions: 


* Set Temperature: Isothermal, 300K
* Number of Molecules = 200 di-ol, 200 di-acid, other species = 0
* Reaction Energy = 40 kJ/mol
* 1 for heat transfer to solvent
* Simulation delay can be set to your preference


Pause the simulation at 50% (±1%) conversion.  You may wish to slow the simulation by using the Simulation Delay tab on the left, and you may reinitialize the simulation if you overshoot.   After pausing, record data for the time, number and weight avg MW(Xn and Xw), and conversion for the stepwise growth reaction. 



Setup a Chain Addition (Free Radical) experiment with the following conditions: 


* Set Temperature: Isothermal, 300K 
* Number of Molecules = 10 initiator, 400 monomer
* Initiator Reaction Energy = 0 kJ/mol, Radical Reaction Energy = 0 kJ/mol
* 1 for heat transfer to solvent
* 1 for combination probability
* Simulation delay can be set to your preference



Pause the simulation at 50% (±1%) conversion.  You may wish to slow the simulation by using the Simulation Delay tab on the left, and you may reinitialize the simulation if you overshoot.   After pausing, record data for the time, number and weight avg MW, and conversion for the Free Radical Chain Addition reaction. 


1. Is the monomer (completely unbonded, chain length = 1) to be consumed faster in the stepwise growth or chain addition polymerization?
1. What is the monomer concentration for each reaction at 50%
1. Which reaction type contained the highest MW chain at the lowest conversions (50%)?
1. What was the Xn at 50% found for each experiment?
1. What Xn would you expect for each in theory
1. Plot Xn vs. conversion for both experiments on the same figure.
1. Plot Xw vs. conversion for both experiments on the same figure.
1. Plot the histogram of frequency vs. chainlength for each experiment on the same graph.  How are these histograms different than you would expect from theory?


## Free Radical Chain Addition Polymerization 

Setup a Chain Addition (Free Radical) experiment with the following conditions: 


* Set Temperature: Isothermal, 300K 
* Number of Molecules = 10 initiator, 400 monomer
* Initiator Reaction Energy = 0 kJ/mol
* Radical Reaction Energy = 0 kJ/mol
* 1 for heat transfer to solvent
* 1 for combination probability
* Simulation delay can be set to your preference


1. What should Xn approach at complete conversion if the initiator concentration is set to 10, 20, and 50 in theory?
1. What does Xn approach if the initiator concentration is set to 10, 20, and 50 in the experiment?
1. Plot the conversion as a function of time for initiators concentrations of 10, 20, and 50.
1. Set the combination probability to 0.  How does this affect your answer to parts 1 and 2?
1. Set the combination probability to 0.5, what values do Xn, Xw, and PDI approach?