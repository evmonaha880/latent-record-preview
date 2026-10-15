function diff(a,b){var A=a.split(' '),B=b.split(' '),n=A.length,m=B.length,L=[],i,j;
 for(i=0;i<=n;i++){L.push(new Array(m+1).fill(0));}
 for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--)L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 var out=[];i=0;j=0;
 while(i<n&&j<m){if(A[i]===B[j]){out.push(['=',A[i]]);i++;j++}else if(L[i+1][j]>=L[i][j+1]){out.push(['-',A[i]]);i++}else{out.push(['+',B[j]]);j++}}
 while(i<n)out.push(['-',A[i++]]);while(j<m)out.push(['+',B[j++]]);return out}
