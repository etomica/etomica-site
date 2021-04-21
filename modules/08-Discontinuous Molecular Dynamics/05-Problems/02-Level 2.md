

**Problem 1**

This problem uses a  
[square well MD (2D) simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)


Throughout this problem, the simulation should be set to run in "isothermal" mode.
Define a dimensionless density as <i>bρ ≡ η ≡ NA ρπσ</i>²/4 where NA is Avogadro's number. 

(a) After completing Level1 Problem3 (aka. "1.3"), simulate 1000ps for “repulsion only” and “repulsion+attraction” at densities of 5.95E-6 and 7.27E-6 mol/m² and a temperature of 300K.  Plot Z vs. η for the two cases.  Also show the van der Waals estimate for $Z_{HS}^{vdW}=1/(1- \eta )$, the ESD estimate $Z_{HS}^{ESD}=1+4\eta /(1-1.9\eta )$, and the CS estimate $Z_{HS}^{CS}=1+4\eta (1-\eta /2)/(1-\eta )^3$.

(b) For the “repulsion+attraction,” simulate at a density of 4.29E-6 and temperatures of 500, 1000, 1500.  Plot Z vs. 1/T, where <i>Z=P/(ρRT)=PV/RT</i>.  Note that $\rho$(=) mol/m² and Z should be dimensionless.  Explain your observations.  What value do you obtain for $ a $ in $Z-Z_{HS}= -a \rho /RT$?

**Problem 2**

This problem uses a  
[square well MD (3D) simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)


Throughout this problem, the simulation should be set to run in "adiabatic" mode.
Recall that the packing fraction is a dimensionless density as <i>bρ ≡ η ≡ NA ρπσ</i>³/6 where NA is Avogadro's number.


(a) Simulate 300 ps for “repulsion only” at <i>η</i> = 0.055 and 0.325 and a temperature of 300K.  Record values for T, P, U and the std error of each.

(b) Trace the rdf vs. r for the case at <i>η</i> = 0.325, indicating the values on the ordinate and abscissa. 

(c) Erpenbeck and Wood obtained the following results based on extensive simulations with large numbers of molecules.  Plot these along with your data on the same axes.  Use open symbols for your data and solid symbols for the E&W data.

(d) Plot on the same axes the van der Waals estimate for $Z_{HS}^{vdW}=1/(1-\eta )$, the ESD estimate $Z_{HS}^{ESD}=1+4\eta /(1-1.9\eta )$, and the CS estimate $Z_{HS}^{CS}=1+4\eta (1-\eta /2)/(1-\eta )^3$.  Which do you like best?

(e) How can you rearrange the data so that you can use the “trendline.xls” function to estimate $ z_1, z_2, z_3$ in $Z = 1+ (z_1\eta  +z_2\eta^2 +z_3\eta^3)/(1-\eta)^3 $?

(f) What values do you obtain for $ z_1, z_2, z_3 $ in 2D?  In 3D?  Also report the %AAD for each model, where $%AAD = (\sum |calc-obs|/obs*100%)/n_{obs}$, and $n_{obs}$ is the # of observations.


**Problem 3**

This problem uses a  
[square well MD (3D) simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)


Throughout this problem, the simulation should be set to run in "isothermal" mode.  Define a dimensionless density as <i>bρ ≡ η ≡ NA ρπσ</i>³/6 and λ = 2.0.


(a) For “repulsion+attraction,” simulate 300ps at η=0.325 and 300K (isothermal mode). Record values for T, P, U and the std error of each.  Also include estimates of the rdf g(x) at x=1, 1.2, 1.4, 1.6, 1.8, 2.0 where x ≡ r/σ.

(b) Results at 400, 750, and 1200K are shown below.  Including these results (solid symbols) and your own (open symbol) at ~300K, plot Z vs. 1/T, where <i>Z=P/(ρRT)=PV/RT</i>.  Also include the value of ZHS from Problem1.6, assigning 1/T=0 for this point.  Note that <i>ρ</i>(=) mol/L and Z should be dimensionless if you use the appropriate value for R.  Explain your observations.  What value do you obtain for a in $Z- ZHS = a\rho /RT$?
(c) For the data of part (b), plot U/ε vs. ε/kT.  Explain your observations.  What value do you obtain for $a$ in $(U-UHS)=a\rho$?


SW results at η = 0.325, λ = 2.0, ε = 1000J/mol, σ = 0.4nm.

```
<table align="center" width="100%">
<tr>
<td width="12%">T(K)
<td width="7%">t(ps)
<td width="7%">t(min)
<td width="12%">P(MPa)
<td width="12%">U(J/mol)
<td width="10%">$g(\sigma )$
<td width="10%">$g(1.2\sigma )$
<td width="10%">$g(1.4\sigma )$
<td width="10%">$g(1.6\sigma )$
<td width="10%">$g(1.8\sigma )$
<td width="10%">$g(2\sigma )$
</tr>
<tr>
<td width="12%">$399 ± 12$
<td width="7%">333
<td width="7%">55
<td width="12%">123 ± 8
<td width="12%">-1005 ± 0.48
<td width="10%">~2.6
<td width="10%">~1.4
<td width="10%">~0.98
<td width="10%">~0.8
<td width="10%">~0.98
<td width="10%">~1.3
</tr>
<tr>
<td width="12%">745 ± 8
<td width="7%">415
<td width="7%">84
<td width="12%">433 ± 5
<td width="12%">-985 ± 0.74
<td width="10%">~2.54
<td width="10%">~1.45
<td width="10%">~0.98
<td width="10%">~0.78
<td width="10%">~0.95
<td width="10%">~1.22
</tr>
<tr>
<td width="12%">1123 ± 10
<td width="7%">434
<td width="7%">105
<td width="12%">769 ± 7
<td width="12%">-978 ± 0.27
<td width="10%">~2.49
<td width="10%">~1.50
<td width="10%">~2.04
<td width="10%">~0.76
<td width="10%">~0.9
<td width="10%">~1.15
</tr>
<tr>
<td width="12%">∞ (HS,300)
<td width="7%">355
<td width="7%">1
<td width="12%">183 ± 2
<td width="12%">NA
<td width="10%">~2.45
<td width="10%">~1.53
<td width="10%">~1.03
<td width="10%">~0.77
<td width="10%">~0.85
<td width="10%">~1.07
</tr>
</table>
```

Hint : Look at the time in minutes for each simulation and estimate the time for your simulation.  Staring at a computer screen for an extended time is not a recommended aspect of this problem.

**Problem 4**

Do better model equations really lead to better extrapolations?  HW2.1 makes the vdW repulsive term look pretty bad, but we can make it fit the data of Ex. 8 by tuning the a and b parameters.  We can replace the vdW repulsive term with the CS repulsive term while retaining the vdW attractive term to obtain a better model.  Then we have,

vdW: $Z = 1 + \frac{\eta}{1 - \eta } - \frac{a}{bRT} \eta$

CS+vdW : $Z = 1 + \frac{4\eta (1-\eta / 2)}{(1-\eta )^3} - \frac{a}{bRT} \eta$


where $\eta \equiv b\rho$.  For both models, use the data in Ex. 8 to find the values of η (and b) that fit Z at $\beta \varepsilon = 0$, then determine the value of a that matches the Z value at 205.6K.  Then use the same values of a and b to predict the data given in HW2.3.  Plot all the data and both models on one set of axes and discuss your observations. 

**Problem 5**

Classical thermodynamics shows how $(A-A^{HS})/RT$ can be computed by integration of Z or U  (e.g. E&L, Ch5-7).

1. Use trapezoidal rule to estimate $(A-A^{HS})/RT$ at $\eta = 0.325$ and T=300K based on HW2.3.
1. Use your result from HW2.3 along with the data below to estimate $(A-A^{HS})/RT$ at $\eta = 0.325$ and T=300K and compare to part a.

SW results at $T \approx 300K$, $\lambda = 2.0$, $\varepsilon = 1000J/mol$, $\sigma = 0.4nm$.


```
<table width="90%">
<tr>
<td width="20%">ρ(mol/L)
<td width="10%">T(K)
<td width="10%">t(ps)
<td width="10%">t(min)
<td width="10%">P(MPa)
<td width="20%">U(J/mol)
<td width="5%">$g(\sigma )$
<td width="5%">$g(2\sigma )$
</tr>
<tr>
<td width="10%">2.77
<td width="20%">$300.5 \pm 6.1$
<td width="10%">2389
<td width="10%">18
<td width="10%">$3.8 \pm 1$
<td width="20%">$-216 \pm 1$
<td width="10%">1.98
<td width="10%">1.45
</tr>
<tr>
<td width="10%">5.41
<td width="20%">$300.1 \pm 3.7$
<td width="10%">2211
<td width="10%">37
<td width="10%">$3.5 \pm 1$
<td width="20%">$-396 \pm 2$
<td width="10%">~2.52
<td width="10%">~1.48
</tr>
<tr>
<td width="10%">10.70
<td width="20%">$299.4 \pm 3.4$
<td width="10%">791
<td width="10%">66
<td width="10%">$0.9 \pm 5$
<td width="20%">$-696 \pm 2$
<td width="10%">~2.95
<td width="10%">~1.52
</tr>
<tr>
<td width="10%">22.33
<td width="20%">$295.6 \pm 3.5$
<td width="10%">4131
<td width="10%">363
<td width="10%">$161.3 \pm 6$
<td width="20%">$-1425 \pm 5$
<td width="10%">3.99
<td width="10%">1.55
</tr>
</table>
```

**Problem 6**

This problem uses a  
[square well MD (3D) simulation.](http://rheneas.eng.buffalo.edu/wiki/DMD:Simulator)


[Example 8](http://rheneas.eng.buffalo.edu/wiki/DMD:Example_8) showed how to tune the ε parameter.  Now we explore the σ parameter. 

(a) According to the CS model (cf. Problem1a, Level2 above), what value do you obtain for ZHS at η=0.375? 

(b) What value of σ corresponds to η=0.375 at 22.14 mol/L? 

(c) The simulation results below have been tabulated at η=0.375 and λ=1.7.  What value of βε corresponds to the boiling temperature?  What value of ε(J/mol)?  
  
(d) Prepare a plot Z vs. 1000/T, using your best ε and σ at η=0.375 and showing the data from webbook.nist.gov on the same axes.  

(e) Using the values of ε and σ from part (c) simulate the system at 200K and 20.0 mol/L for ~400ps (got pizza?).  Use the CS equation to estimate the y-intercept value for Z and connect the dots on the same plot as part d. Plot the NIST data for this isochore on the same axes.  This represents a prediction of the data at 20.0 mol/L since the parameters were determined at other conditions. 

(f) What values of <i> a </i> and <i> b </i> of the vdW EOS will match the simulation data of the plot at η=0.375?  Show the vdW results as a dashed line on the plot.

(g) Using the values of <i> a </i> and <i> b </i> from part (f), plot the vdW prediction at 20.0 mol/L as a dashed line on the plot at 20 mol/L.  Comment on the accuracy of the slope and intercept of both models relative to the data.

(h) Neither prediction is perfect.  Suggest ways that we may proceed to improve the predictions further.


SW results at η = 0.375, λ=1.7. 


```
<table width="90%">
<tr>
<td width="15%">η
<td width="15%">    βε
<td width="10%">t(ps)
<td width="10%">t(min)
<td width="15%">    Z
<td width="15%">  -U/Nε
<td width="5%">$g(\sigma )$
<td width="5%">$g(2\sigma )$
</tr>
<tr>
<td width="10%">0.375
<td width="15%">0.431 ± 0.002
<td width="10%">923
<td width="10%">40
<td width="15%">3.54 ± 0.03
<td width="15%">-0.711 ± 0.001
<td width="10%">2.9
<td width="10%">1.02
</tr>
<tr>
<td width="10%">0.375
<td width="20%">0.611 ± 0.002
<td width="10%">418
<td width="10%">23
<td width="10%">2.44 ± 0.04
<td width="20%">-0.725 ± 0.001
<td width="10%">2.85
<td width="10%">1.1
</tr>
<tr>
<td width="10%">0.375
<td width="20%">0.965 ± 0.001
<td width="10%">453
<td width="10%">21
<td width="10%">0.29 ± 0.03
<td width="20%">-0.750 ± 0.0004
<td width="10%">2.9
<td width="10%">1.3
</tr>
</table>
```

**Problem 7**

The following equation can be used to compute the value of Z from the rdf (E&L, ApxB):

$Z = 1 + 4\eta \left \{ g(\sigma^+ ) + \eta \beta \varepsilon - \lambda^3 [1-exp(-\beta \varepsilon)]g(\lambda \sigma^-) \right \}$
		
Where <i> β ≡ 1/kT </i> 


(a) Apply this equation to your results for g from HW2.3 and compare to the simulated Z.

(b) Suppose <i>g(σ)</i> = 2.6 and <i>g(λσ)</i> = 1.4.  What value do you obtain for Z then?

(c) Comment on the sensitivity of Z to the estimate of <i>g(λσ)</i>.


**Problem 8**

The following equation can be used to compute the value of $U-U^{HS}$ from the rdf (E&L, Ch6):

$\frac{U - U^{HS}}{RT} = -12\eta \beta \varepsilon \int_1^{\lambda} g(x)x^2dx$

Where <i> β ≡ 1/kT; x = r/σ </i> 


(a) Plot g*x² vs. x using your results for g from HW2.3. Shade the area represented by the integral.

(b) Apply this equation using trapezoidal rule to your results for g from HW2.3 and compare to the simulated value.

(c) Comment on the sensitivity of U to the estimates of g(x).

(d) After completing 7(a), compare U's sensitivity to that of Z.  What does this tell you about the precision of a difference equation compared to an integral?

 ∞ ε  π  σ λ η β ε ρ ± ≡ ² ³