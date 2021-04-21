
These problems are appropriate for students in an undergraduate/graduate thermodynamics or physical chemistry course.  The Level 1 questions are well-defined tasks, whereas the Level 2 questions are designed to be more open-ended.

## Level 1 
<b>(a)</b> *Using one set of parameters for your surfactant molecules (choose as you see fit), predict the critical temperature and critical density of your fluid, with 40 of these surfactant molecules present.  Do your coexisting densities and interfacial tension values follow the same scaling behavior as the pure fluid? (see Problem #1)*  In order to accomodate the higher temperatures, you will likely have to use a large simulation cell (box size > 20 and number of atoms > 1400).  In order to maintain consistency, use the same simulation parameters at all temperatures.



## Level 2 
<b>(a)</b> Your results from Problem #2 and from part (a) above should give you an indication of the effects of the surfactant parameters on the interfacial tension properties.  If you understand the behavior of your system, you should be able to modify your fluid properties in a reasonable way.  Supposing the goal is to increase the critical temperature of your fluid by 10%, can you achieve this by adding appropriately-designed surfactants to your fluid?  *What surfactant parameters would you initially guess to be appropriate?  Then, test your parameters by adding 20 of these surfactants to your fluid and predicting the critical temperature (either by the corresponding densities or the surface tension values).*



<b>(b)</b> If you were not successful in part (a), you may be able to get closer to your desired value by increasing the surfactant concentration.  Regardless of your success in part (a), increase your surfactant concentration from 20 to 40.  *What is the new shift in your predicted critical temperature?  Is it significantly different from your simulation with 20 surfactants?*



<b>(c)</b> Repeat part (a), but instead, your goal is to lower the critical temperature of your pure fluid by 10%.



<b>(d)</b> Experimentally, as the concentration of surfactants increases, the surfactants may actually start to aggregate into clusters.  These clusters are referred to as micelles, and they may be advantageous in certain applications.  Attempt to create micelles in your simulation cell.  You may freely vary the surfactant parameters or the concentration of the surfactants.  Also, the temperature may play a role.  *Report the conditions which result in the formation of micelles in your simulations.*  You should be able to observe the micelles in the 'configuration' panel.  The concentration at which surfactants begin to assemble into micelles is known as the critical micelle concentration (CMC).