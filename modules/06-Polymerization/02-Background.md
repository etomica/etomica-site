

## Stepwise Growth 
### Stepwise Growth Model 
In the stepwise growth sub-module, the dots will represent different monomer types.  For instance, the red dots represent [diols](http://en.wikipedia.org/wiki/Diol) and the blue dots represent [ dicarboxylic acids](http://en.wikipedia.org/wiki/Dicarboxylic_acid) used to make polyester.  These dots are di-functional (they can bond to 2 other monomers).     No actual “chemistry” is taken into account in the simulation aside from bonding rules. “Alcohol” type monomers are only able to react with “acid” type monomers.  Monomers of the same type do not react with each other.  The terms mono-ol and mono-acid indicate dots of [alcohol](http://en.wikipedia.org/wiki/Alcohol) (light red) and [acid](http://en.wikipedia.org/wiki/Carboxylic_acid) (light blue) types, respectively, which are mono-functional (can only bond with one other molecule).  The terms mono-ol and mono-acid are not generally used chemical names, as they would simply be known as their chemical name such as ethanol or stearic acid.  However, this nomenclature is utilized in the simulation to emphasize the monomer functionality.  The crosslinker (green) dots represent [tri-functional acids](http://en.wikipedia.org/wiki/Tricarboxylic_acid) which are capable of forming crosslinks.  However, in general, crosslinking agents can be of either acid or alcohol type and can have any functionality greater than two.



### Monomer Functionality and Gelation 
By adding mono-functional groups (which react to one other monomer), the user can investigate the end-capping effects of these groups as well as the end-capping effect of a stoichiometric imbalance of the monomers.  Adding tri-functional groups (green dots), labeled “Crosslinker” in the simulation, in various concentrations can demonstrate molecular weight increase, branching, and gelation.  This module serves an excellent tool for demonstrating gelation phenomena (see Examples), because when viewing the model in the mosaic format, it shows how the polymer instantly becomes one enormous molecule of infinite molecular weight.  Gelation can be predicted to occur at a given conversion if the average functionality is greater than or equal to 2, assuming the monomers and crosslinkers are stoichiometricly balanced.  In this case, $f$ is defined as the average functionality of all of the monomers.  For instance, $f$ in the example problem would be defined as:
: f = (700 x 2 + 400 x 2 + 200 x 3) / (700 + 400 + 200) = 2.15

Then, the critical conversion at which gelation will occur is defined as:
:$P_c = \frac{1}{\sqrt{f-1}}$
which in this example equals 0.93. Unfortunately, this derivation only applies strictly for very large numbers of monomers in a 3-D network.  The derivation also assumes that the first, second, and third bond will form with equal reactivity.  Although the simulation does not explicitly enforce any reactivity for these bonds, each additional bond experiences a lower reactivity due to the steric hinderance of the existing bonds.  Despite the three bad assumptions made in this equation, it works fairly well as an approximation in this simulation.  The simulation is also fairly reliable for exhibiting gelation at high conversions as long as $f > 2$.




### Stepwise Growth Kinetics 
Assuming stoichiometric monomer concentrations of diols and diacids, the rate of polymerization is
:$\frac{d[M]}{dt} = -k [M]^2$
where $[M]$ is the unreacted concentration of either monomer.  Note the reaction constant, $k$, may be dependent on temperature.  The conversion without catalysis is expected to be related to time via  
:$\frac{1}{1-p} = [M_0]k t + 1.$
Note the conversion can be converted to the unreacted monomer concentration by multiplying the initial monomer concentration by $(1-p)$.
The number-average degree of polymerization, the weight-average degree of polymerization, and for the polydispersity index should be:
: ![](./Beq4.JPG)

The calculation of the maximum molecular weight for a nonstoichiometric mixture should simply be the total mass divided by the number of monomers in excess, which should approach infinity with perfect stoichiometry.  The effects of temperature may also be modeled.  Moderate temperature increases should increase the rate of reaction by increasing the number of molecular collisions.  However, excessive heating should cause de-polymerization as the thermal forces rip the polymer apart. 
Note that the derivations of these equations can be found in G. Odian’s “Principles of Polymerization, 3rd ed.”

## Free Radical Chain Addition 
### Chain Addition Model 
In the chain-addition polymerization sub-module, the user can choose the concentration of the initiator and the monomer. All of the monomers in this simulation are considered to be identical and to have one double bond.  The initiator will thermally decompose into two reactive radicals.  The thermal energy required for this decomposition is user-defined.  The initiator will dissociate into two free radicals.  The free radicals can then react to a monomer molecule and bond to it.  This step is known as “initiation,” because this step initiates a growing polymer chain.  The free radical is then deactivated and the newly attached monomer is then activated as a radical species.  This monomer can then react with another monomer, at which point, the active radical is passed from the formerly active monomer to the added monomer, and so forth.  This series of events is known as the “propagation” step of the polymerization reaction.  The last step of the polymerization reaction is “termination,” where the two radicals contact and react.  One method of termination is that of combination, where the two propagating chains react to form one larger chain.  The other method of termination allowed by the model is disproportionation, where a radical species is transferred from one propagating chain to the next, leaving two, separate, unreactive polymer chains.  The probability the chains will terminate via combination instead of disproportionation is user defined.



Various molecular weight distributions as initiator concentrations, monomer concentrations, initiator dissociation rates, chain transfer rates, and termination mechanisms can be investigated.  The development and the resultant molecular weight distribution is significantly different from the step-wise growth sub-module.  Having both of these sub-modules built into the same simulation will help students visualize how the different polymerization reactions function and how they result in significantly different polymers.  Note that it is also possible to have cross-linking in free radical chain addition, although cross-linking groups are not included in this simulation.

### Chain Addition Kinetics 

Again, the author recommends Odian’s Textbook (see below) for a detailed discussion of free radical chain addition kinetics.  The analysis of the kinetics of these reactions are complex, because all three reaction steps (initiation, propagation, termination) must be modeled.  However, after some time, the number of free radicals formed by initiation will be equal to the number removed by termination.  At this point, a steady-state concentration of propagating chains can be assumed, making the derivation of the polymerization rates and molecular weights tractable.  However, this derivation is omitted, because it requires very large numbers of molecules over a long time period on a molecular simulation scale.  As a result, this model does not model steady-state chain addition kinetics very well, and hence they are not discussed at length.  Non-steady state kinetics are best considered numerically.  Despite this shortfall of the model, the user can still model the propagation rate of an active chain by setting the initiator bond energy to 0 (causing instant initiation) and analyzing the simulation at shorter time frames (so that termination becomes less relevant).  However, the model still successfully predicts that the number-average degree of polymerization for reactions which terminate by disproportionation as a function of conversion is defined as Xn = 1/(1-p) .

## Recommended Reading
The following textbooks have are recommended for those who are interested in developing a broader understanding of polymer science and engineering.




For a broader understanding of physical polymer science, the author recommends:
* L.H. Sperling’s “Introduction to Physical Polymer Science”
* S.F. Sun’s “Physical Chemistry of Macromolecules”
*P.C. Painter’s and M.M. Coleman’s “Fundamentals of Polymer Science”
For a more detailed discussion of polymerization chemistry and kinetics, the author recommends:
* G. Odian’s “Principles of Polymerization”
For a concise reference regarding polymer processing, the author recommends:
* T.A. Osswald’s “Polymer Processing Fundamentals”